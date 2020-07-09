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

	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
)

func ProcessFile(logger logging.Logger, krtFile io.Reader, dstDir string) (*Krt, error) {
	p := Parser{
		logger,
		dstDir,
	}

	k, err := p.Parse(krtFile)
	if err != nil {
		return nil, err
	}
	err = p.Validate(k)
	if err != nil {
		return nil, err
	}
	return k, nil
}

type Parser struct {
	logger logging.Logger
	dstDir string
}

type Metadata struct {
	yamlFile string
	files    []string
}

func (p *Parser) Parse(krtFile io.Reader) (*Krt, error) {
	p.logger.Info("Decompressing KRT file...")
	meta, err := p.extractKrtFile(krtFile, p.dstDir)
	if err != nil {
		return nil, fmt.Errorf("error on KRT extraction: %w", err)
	}
	p.logger.Infof("Extracted files: %s", strings.Join(meta.files, ", "))

	p.logger.Info("Parsing KRT file")
	krt, err := generateKrt(meta.yamlFile)
	if err != nil {
		return nil, fmt.Errorf("error on KRT Yaml parsing: %w", err)
	}

	return krt, nil
}

func (p *Parser) Validate(krt *Krt) error {
	p.logger.Info("Validating KRT file")
	err := ValidateYaml(krt)
	if err != nil {
		return fmt.Errorf("error on KRT Yaml validation: %w", err)
	}

	p.logger.Info("Validating KRT src paths")
	err = validateSrcPaths(krt, p.dstDir)
	if err != nil {
		return fmt.Errorf("error on KRT Src validation: %w", err)
	}

	p.logger.Info("Validating KRT workflows")
	err = validateWorkflows(krt)
	if err != nil {
		return fmt.Errorf("error on KRT Workflow validation: %w", err)
	}

	return nil
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

func (p *Parser) extractKrtFile(krtFile io.Reader, dstDir string) (*Metadata, error) {
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

		err = p.processFile(tarReader, filePath, tarFile.Typeflag)
		if err != nil {
			return nil, err
		}

		if reYamlFile.MatchString(tarFile.Name) {
			meta.yamlFile = filePath
		}
		meta.files = append(meta.files, filePath)
	}

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

		p.logger.Debugf("Extracting file: %s", filePath)

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
