package usecase

import (
	"archive/tar"
	"compress/gzip"
	"errors"
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/service"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"gopkg.in/yaml.v2"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
)

type VersionStatus string

var (
	VersionStatusCreated VersionStatus = "CREATED"
	VersionStatusActive  VersionStatus = "ACTIVE"
	VersionStatusRunning VersionStatus = "RUNNING"
	VersionStatusStopped VersionStatus = "STOPPED"
)

type VersionInteractor struct {
	logger         logging.Logger
	versionRepo    repository.VersionRepo
	runtimeService service.RuntimeService
}

func NewVersionInteractor(
	logger logging.Logger,
	versionRepo repository.VersionRepo,
	runtimeService service.RuntimeService,
) *VersionInteractor {
	return &VersionInteractor{
		logger,
		versionRepo,
		runtimeService,
	}
}

type KrtYml struct {
	Version     string `yaml:"version"`
	Description string `yaml:"description"`
}

func (i *VersionInteractor) Create(userID, runtimeID string, krtFile io.Reader) (*entity.Version, error) {
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

	v, err := i.versionRepo.Create(userID, runtimeID, krtYML.Version, krtYML.Description)
	if err != nil {
		return nil, err
	}

	// TODO move to a new DeploymentVersion method
	err = i.runtimeService.DeployVersion(&entity.Runtime{}, krtYML.Version)
	if err != nil {
		return nil, err
	}

	return v, nil
}
