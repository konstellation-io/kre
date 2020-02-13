package krt

import (
	"archive/tar"
	"compress/gzip"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"regexp"

	"github.com/go-playground/validator/v10"
	"gopkg.in/yaml.v2"

	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

// KrtNode contains data about a version's node
type KrtNode struct {
	Name  string `yaml:"name" validate:"required,resource-name,gt=1,lt=20"`
	Image string `yaml:"image" validate:"required"`
	Src   string `yaml:"src" validate:"required"`
}

// KrtWorkflow contains data about a version's workflow
type KrtWorkflow struct {
	Name       string   `yaml:"name" validate:"required,resource-name,gt=1,lt=20"`
	Entrypoint string   `yaml:"entrypoint" validate:"required"`
	Sequential []string `yaml:"sequential" validate:"required"`
}

type KrtEntrypoint struct {
	Proto string `yaml:"proto" validate:"required,endswith=.proto"`
	Image string `yaml:"image" validate:"required"`
	Src   string `yaml:"src" validate:"required"`
}

type KrtConfig struct {
	Variables []string `yaml:"variables validate:"env""`
	Files     []string `yaml:"files"`
}

// Krt contains data about a version
type Krt struct {
	Version     string        `yaml:"version" validate:"required,resource-name,gt=1,lt=20"`
	Description string        `yaml:"description" validate:"required"`
	Entrypoint  KrtEntrypoint `yaml:"entrypoint" validate:"required"`
	Config      KrtConfig     `yaml:"config" validate:"required"`
	Nodes       []KrtNode     `yaml:"nodes" validate:"required,min=1"`
	Workflows   []KrtWorkflow `yaml:"workflows" validate:"required,min=1"`
}

func CreateKrtYaml(logger logging.Logger, tmpDir string, krtFile io.Reader) (*Krt, error) {
	// Get name and description from krtFile
	logger.Info("Decompressing KRT file...")
	uncompressed, err := gzip.NewReader(krtFile)
	if err != nil {
		return nil, fmt.Errorf("error Decompressing KRT file: %w", err)
	}

	krtYmlPath := ""
	tarReader := tar.NewReader(uncompressed)

	for {
		header, err := tarReader.Next()
		if err == io.EOF {
			break
		}

		if err != nil {
			return nil, fmt.Errorf("error reading krt file: %w", err)
		}

		path := filepath.Join(tmpDir, header.Name)
		logger.Info(" - " + path)

		matched, err := regexp.Match("(^|/)krt.ya?ml$", []byte(header.Name))
		if err != nil {
			return nil, fmt.Errorf("error regex expr for krt.yaml with value %s: %w", header.Name, err)
		}
		if matched {
			krtYmlPath = path
		}

		switch header.Typeflag {
		case tar.TypeDir:
			if err := os.Mkdir(path, 0755); err != nil {
				return nil, fmt.Errorf("error set permissions for krt.yaml: %w", err)
			}
		case tar.TypeReg:
			outFile, err := os.Create(path)
			if err != nil {
				return nil, fmt.Errorf("error creating path %s: %w", path, err)
			}
			if _, err := io.Copy(outFile, tarReader); err != nil {
				return nil, err
			}
			err = outFile.Close()
			if err != nil {
				return nil, err
			}
		default:
			return nil, fmt.Errorf("error extracting tar.gz, uknown type: %v in %s: %w", header.Typeflag, path, err)
		}
	}

	var krt Krt

	krtYmlFile, err := ioutil.ReadFile(krtYmlPath)
	if err != nil {
		return nil, fmt.Errorf("error reading file %s: %w", krtYmlPath, err)
	}

	logger.Info("Parsing KRT file")
	err = yaml.Unmarshal(krtYmlFile, &krt)
	if err != nil {
		logger.Error(err.Error())
		return nil, fmt.Errorf("error Unmarshal yaml file: %w", err)
	}

	err = krt.Validate(tmpDir)
	if err != nil {
		return nil, fmt.Errorf("error validating kre: %w", err)
	}

	return &krt, nil
}

func (k *Krt) Validate(tmpDir string) error {
	validate := k.GetValidator()
	err := validate.Struct(k)
	if err != nil {
		// this check is only needed when your code could produce
		// an invalid value for validation such as interface with nil
		// value most including myself do not usually have code like this.
		if _, ok := err.(*validator.InvalidValidationError); ok {
			fmt.Println(err)
			return errors.New("error on KRT validation InvalidValidationError")
		}

		validationErrors := err.(validator.ValidationErrors)
		fmt.Println("errors on validate krt: %w", validationErrors)
		return errors.New("error on KRT validation ValidationErrors")
	}

	err = validateContent(tmpDir, k)
	if err != nil {
		return errors.New("error on KRT validation validateContent")
	}

	err = validateWorkflows(k)
	if err != nil {
		return errors.New("error on KRT validation validateWorkflows")
	}

	return nil
}

func validateContent(tmpDir string, k *Krt) error {
	entrypointFile := path.Join(tmpDir, k.Entrypoint.Src)
	if !fileExists(entrypointFile) {
		return errors.New(fmt.Sprintf("error entrypointFile %s not exists", entrypointFile))
	}

	for _, node := range k.Nodes {
		nodeFile := path.Join(tmpDir, node.Src)
		if !fileExists(nodeFile) {
			return errors.New(fmt.Sprintf("error src File %s for node %s not exists ", nodeFile, node.Name))
		}
	}

	return nil
}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

func validateWorkflows(k *Krt) error {
	nodeList := make([]string, len(k.Nodes))
	for i, node := range k.Nodes {
		nodeList[i] = node.Name
	}

	for _, workflow := range k.Workflows {
		for _, seq := range workflow.Sequential {
			found := false
			for _, node := range nodeList {
				if node == seq {
					found = true
				}
			}
			if !found {
				return errors.New(fmt.Sprintf("error Not found node: %s", seq))
			}
		}
	}

	return nil
}
