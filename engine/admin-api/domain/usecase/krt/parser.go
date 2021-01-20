package krt

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"gopkg.in/yaml.v2"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

func ProcessYaml(logger logging.Logger, krtFilePath, dstDir string) (*Krt, error) {
	p := Parser{
		logger,
		dstDir,
	}

	k, err := p.ParseKrtYaml(krtFilePath)
	if err != nil {
		return nil, err
	}
	err = p.ValidateYaml(k)
	if err != nil {
		return nil, err
	}
	return k, nil
}

func ProcessContent(logger logging.Logger, krtYml *Krt, krtFilePath, dstDir string) []error {
	p := Parser{
		logger,
		dstDir,
	}

	err := p.Extract(krtFilePath)
	if err != nil {
		return []error{err}
	}

	return p.ValidateContent(krtYml)
}

type Parser struct {
	logger logging.Logger
	dstDir string
}

type Metadata struct {
	yamlFile string
	files    []string
}

func (p *Parser) ParseKrtYaml(krtFilePath string) (*Krt, error) {
	p.logger.Info("Decompressing KRT file...")
	krtYamlPath, err := p.extractKrtYaml(krtFilePath, p.dstDir)
	if err != nil {
		return nil, fmt.Errorf("error on KRT Yaml extraction: %w", err)
	}
	p.logger.Infof("Extracted file: %s", krtYamlPath)

	p.logger.Info("Parsing KRT file")
	krt, err := generateKrt(krtYamlPath)
	if err != nil {
		return nil, fmt.Errorf("error on KRT Yaml parsing: %w", err)
	}

	return krt, nil
}

func (p *Parser) Extract(krtFilePath string) error {
	p.logger.Info("Decompressing KRT file...")
	meta, err := p.extractKrtFile(krtFilePath, p.dstDir)
	if err != nil {
		return fmt.Errorf("error on KRT content extraction: %w", err)
	}
	p.logger.Infof("Extracted files: %s", strings.Join(meta.files, ", "))

	return nil
}

func (p *Parser) ValidateYaml(krt *Krt) error {
	p.logger.Info("Validating KRT file")
	err := ValidateYaml(krt)
	if err != nil {
		return err
	}

	p.logger.Info("Validating KRT workflows")
	err = validateWorkflows(krt)
	if err != nil {
		return fmt.Errorf("error on KRT Workflow validation: %w", err)
	}

	return nil
}

func (p *Parser) ValidateContent(krt *Krt) []error {
	p.logger.Info("Validating KRT src paths")
	errors := validateSrcPaths(krt, p.dstDir)
	if len(errors) > 0 {
		errors = append([]error{fmt.Errorf("error on KRT Src validation")}, errors...)
	}

	return errors
}

func generateKrt(yamlFile string) (*Krt, error) {
	var krt Krt
	krtYmlFile, err := ioutil.ReadFile(yamlFile)
	if err != nil {
		return nil, fmt.Errorf("error reading file %s: %w", yamlFile, err)
	}

	err = yaml.Unmarshal(krtYmlFile, &krt)
	if err != nil {
		return nil, fmt.Errorf("error Unmarshal yaml file: %w", err)
	}

	return &krt, nil
}

func (p *Parser) extractKrtYaml(krtFilePath, dstDir string) (string, error) {
	krtFile, err := os.Open(krtFilePath)
	defer krtFile.Close()
	if err != nil {
		return "", fmt.Errorf("error Opening KRT file: %w", err)
	}
	uncompressed, err := gzip.NewReader(krtFile)
	if err != nil {
		return "", fmt.Errorf("error Decompressing KRT file: %w", err)
	}

	reYamlFile := regexp.MustCompile("(^|/)krt.ya?ml$")
	tarReader := tar.NewReader(uncompressed)

	for {
		tarFile, err := tarReader.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return "", fmt.Errorf("error reading krt file: %w", err)
		}

		filePath := filepath.Join(dstDir, tarFile.Name)

		if reYamlFile.MatchString(tarFile.Name) {
			err = p.processFile(tarReader, filePath, tarFile.Typeflag)
			if err != nil {
				return "", err
			}
			return filePath, nil
		}

	}

	return "", fmt.Errorf("error krt.yml file missing")
}

func (p *Parser) extractKrtFile(krtFilePath, dstDir string) (*Metadata, error) {
	krtFile, err := os.Open(krtFilePath)
	defer krtFile.Close()
	if err != nil {
		return nil, fmt.Errorf("error Opening KRT file: %w", err)
	}

	meta := &Metadata{}
	uncompressed, err := gzip.NewReader(krtFile)
	if err != nil {
		return nil, fmt.Errorf("error Decompressing KRT file: %w", err)
	}

	reYamlFile := regexp.MustCompile("(^|/)krt.ya?ml$")
	tarReader := tar.NewReader(uncompressed)

	for {
		tarFile, err := tarReader.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return nil, fmt.Errorf("error reading krt file: %w", err)
		}

		filePath := filepath.Join(dstDir, tarFile.Name)

		if reYamlFile.MatchString(tarFile.Name) {
			meta.yamlFile = filePath
		} else {
			err = p.processFile(tarReader, filePath, tarFile.Typeflag)
			if err != nil {
				return nil, err
			}
		}
		meta.files = append(meta.files, filePath)
	}

	p.logger.Info("All files extracted")
	return meta, nil
}

func (p *Parser) processFile(tarReader *tar.Reader, filePath string, fileType byte) error {
	switch fileType {
	case tar.TypeDir:
		if err := os.Mkdir(filePath, 0755); err != nil {
			return fmt.Errorf("error creating krt dir %s: %w", filePath, err)
		}

		p.logger.Debugf("Creating folder: %s", filePath)

	case tar.TypeReg:
		outFile, err := os.Create(filePath)

		if err != nil {
			return fmt.Errorf("error creating krt file %s: %w", filePath, err)
		}

		if _, err := io.Copy(outFile, tarReader); err != nil {
			return fmt.Errorf("error copying krt file %s: %w", filePath, err)
		}

		err = outFile.Close()
		if err != nil {
			return fmt.Errorf("error closing krt file %s: %w", filePath, err)
		}

	default:
		return fmt.Errorf("error extracting krt files: uknown type [%v] in [%s]", fileType, filePath)
	}

	return nil
}
