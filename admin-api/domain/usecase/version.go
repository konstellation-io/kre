package usecase

import (
	"archive/tar"
	"compress/gzip"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"time"

	"github.com/iancoleman/strcase"
	"github.com/minio/minio-go/v6"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/service"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"gopkg.in/yaml.v2"
)

type VersionStatus string

var (
	VersionStatusCreated VersionStatus = "CREATED"
	VersionStatusActive  VersionStatus = "ACTIVE"
	VersionStatusRunning VersionStatus = "RUNNING"
	VersionStatusStopped VersionStatus = "STOPPED"
	ErrVersionNotFound                 = errors.New("error version not found")
)

type VersionInteractor struct {
	logger         logging.Logger
	versionRepo    repository.VersionRepo
	runtimeRepo    repository.RuntimeRepo
	runtimeService service.RuntimeService
}

func NewVersionInteractor(
	logger logging.Logger,
	versionRepo repository.VersionRepo,
	runtimeRepo repository.RuntimeRepo,
	runtimeService service.RuntimeService,
) *VersionInteractor {
	return &VersionInteractor{
		logger,
		versionRepo,
		runtimeRepo,
		runtimeService,
	}
}

type KrtYmlWorkflow struct {
	Name       string   `yaml:"name"`
	Entrypoint string   `yaml:"entrypoint"`
	Sequential []string `yaml:"sequential"`
}

type KrtYml struct {
	Version     string           `yaml:"version"`
	Description string           `yaml:"description"`
	Workflows   []KrtYmlWorkflow `yaml:"workflows"`
}

func (i *VersionInteractor) Create(userID, runtimeID string, krtFile io.Reader) (*entity.Version, error) {
	runtime, err := i.runtimeRepo.GetByID(runtimeID)
	if err != nil {
		return nil, err
	}
	// Get name and description from krtFile
	i.logger.Info("Decompressing KRT file...")
	uncompressed, err := gzip.NewReader(krtFile)
	if err != nil {
		return nil, err
	}

	tmpDir, err := ioutil.TempDir("", "version")
	if err != nil {
		return nil, err
	}
	i.logger.Info("Created temp dir to extract the KRT files at " + tmpDir)

	krtYmlPath := ""

	tarReader := tar.NewReader(uncompressed)
	for {
		header, err := tarReader.Next()
		if err == io.EOF {
			break
		}

		if err != nil {
			return nil, err
		}

		path := filepath.Join(tmpDir, header.Name)
		i.logger.Info(" - " + path)

		matched, err := regexp.Match("/krt.ya?ml$", []byte(header.Name))
		if err != nil {
			return nil, err
		}
		if matched {
			krtYmlPath = path
		}

		switch header.Typeflag {
		case tar.TypeDir:
			if err := os.Mkdir(path, 0755); err != nil {
				return nil, err
			}
		case tar.TypeReg:
			outFile, err := os.Create(path)
			if err != nil {
				return nil, err
			}
			if _, err := io.Copy(outFile, tarReader); err != nil {
				return nil, err
			}
			err = outFile.Close()
			if err != nil {
				return nil, err
			}
		default:
			return nil, errors.New(
				fmt.Sprintf("ExtractTarGz: uknown type: %v in %s", header.Typeflag, path),
			)
		}
	}

	var krtYML KrtYml

	krtYmlFile, err := ioutil.ReadFile(krtYmlPath)
	if err != nil {
		return nil, err
	}

	err = yaml.Unmarshal(krtYmlFile, &krtYML)
	if err != nil {
		return nil, err // TODO send custom error for invalid yaml
	}

	var workflows []entity.Workflow
	if len(krtYML.Workflows) > 0 {
		for _, w := range krtYML.Workflows {
			workflows = append(workflows, i.generateWorkflow(w))
		}
	}

	versionCreated, err := i.versionRepo.Create(userID, runtimeID, krtYML.Version, krtYML.Description, workflows)
	if err != nil {
		return nil, err
	}
	i.logger.Info("Version created ")

	// Create bucket
	ns := strcase.ToKebab(runtime.Name)
	endpoint := fmt.Sprintf("kre-minio.%s:9000", ns)
	accessKeyID := runtime.Minio.AccessKey
	secretAccessKey := runtime.Minio.SecretKey
	useSSL := false

	fmt.Printf("Minio data: %#v \n endpoint: %s", runtime, endpoint)
	// Initialize minio client object.
	minioClient, err := minio.New(endpoint, accessKeyID, secretAccessKey, useSSL)

	if err != nil {
		return nil, err
	}
	i.logger.Info("Minio connected")
	// Make version bucket
	bucketName := krtYML.Version
	location := ""

	err = minioClient.MakeBucket(bucketName, location)
	if err != nil {
		// Check to see if we already own this bucket (which happens if you run this twice)
		exists, errBucketExists := minioClient.BucketExists(bucketName)
		if errBucketExists == nil && exists {
			i.logger.Info(fmt.Sprintf("We already own %s\n", bucketName))
		} else {
			return nil, err
		}
	}
	i.logger.Info(fmt.Sprintf("Bucket %s connected", bucketName))

	// Copy all KRT files
	err = filepath.Walk(tmpDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Upload the zip file
		if info.IsDir() {
			return nil
		}
		i.logger.Info(fmt.Sprintf("Uploading file %s", path))
		filePath, _ := filepath.Rel(tmpDir, path)
		_, err = minioClient.FPutObject(bucketName, filePath, path, minio.PutObjectOptions{})
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return versionCreated, nil
}

func (i *VersionInteractor) generateWorkflow(w KrtYmlWorkflow) entity.Workflow {
	var nodes []entity.Node
	var edges []entity.Edge

	var previousN *entity.Node
	for _, n := range w.Sequential {
		node := &entity.Node{
			ID:     uuid.New().String(),
			Name:   n,
			Status: "ACTIVE", // TODO get status using runtime-api or k8s
		}

		if previousN != nil {
			e := entity.Edge{
				ID:       uuid.New().String(),
				FromNode: previousN.ID,
				ToNode:   node.ID,
			}
			edges = append(edges, e)
		}

		nodes = append(nodes, *node)
		previousN = node
	}

	return entity.Workflow{
		Name:  w.Name,
		Nodes: nodes,
		Edges: edges,
	}
}

func (i *VersionInteractor) Deploy(userID string, versionID string) (*entity.Version, error) {
	i.logger.Info(fmt.Sprintf("The user %s is deploying version %s", userID, versionID))

	version, err := i.versionRepo.GetByID(versionID)
	if err != nil {
		return nil, err
	}

	runtime, err := i.runtimeRepo.GetByID(version.RuntimeID)
	if err != nil {
		return nil, err
	}

	err = i.runtimeService.DeployVersion(runtime, version.Name)
	if err != nil {
		return nil, err
	}

	version.Status = string(VersionStatusRunning)
	err = i.versionRepo.Update(version)
	if err != nil {
		return nil, err
	}

	return version, nil
}

func (i *VersionInteractor) Activate(userID string, versionID string) (*entity.Version, error) {
	i.logger.Info(fmt.Sprintf("The user %s is activating version %s", userID, versionID))

	version, err := i.versionRepo.GetByID(versionID)
	if err != nil {
		return nil, err
	}

	runtime, err := i.runtimeRepo.GetByID(version.RuntimeID)
	if err != nil {
		return nil, err
	}

	// Deactivate the previous active version
	versions, err := i.versionRepo.GetByRuntime(runtime.ID)
	if err != nil {
		return nil, err
	}
	if len(versions) > 0 {
		for _, v := range versions {
			if v.Status == string(VersionStatusActive) {
				v.Status = string(VersionStatusRunning)
				v.ActivationUserID = nil
				v.ActivationDate = nil
				err = i.versionRepo.Update(&v)
				if err != nil {
					return nil, err
				}
				break
			}
		}
	}

	err = i.runtimeService.ActivateVersion(runtime, version.Name)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	version.ActivationDate = &now
	version.ActivationUserID = &userID
	version.Status = string(VersionStatusActive)
	err = i.versionRepo.Update(version)
	if err != nil {
		return nil, err
	}

	return version, nil
}

func (i *VersionInteractor) GetByRuntime(runtimeID string) ([]entity.Version, error) {
	return i.versionRepo.GetByRuntime(runtimeID)
}

func (i *VersionInteractor) GetByID(id string) (*entity.Version, error) {
	return i.versionRepo.GetByID(id)
}
