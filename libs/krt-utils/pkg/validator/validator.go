package validator

import (
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path"
	"regexp"
	"strings"

	"github.com/docker/distribution/reference"
	"github.com/go-playground/validator/v10"
	"github.com/konstellation-io/kre/libs/simplelogger"
	"gopkg.in/yaml.v3"

	"github.com/konstellation-io/kre/libs/krt-utils/pkg/krt"
)

var (
	// register validator for resource names. Ex: name-valid123.
	reResourceName = regexp.MustCompile("^[a-z0-9]([-a-z0-9]*[a-z0-9])?$")
	// register validator for env var names. Ex: NAME_VALID123.
	reEnvVar = regexp.MustCompile("^[A-Z0-9]([_A-Z0-9]*[A-Z0-9])?$")
)

// Validator struct contains methods to validate a KRT file.
type Validator struct {
	logger    simplelogger.SimpleLoggerInterface
	validator *validator.Validate
}

// New creates a new Validator instance.
func New() Validator {
	return NewWithLogger(simplelogger.New(simplelogger.LevelInfo))
}

// NewWithLogger creates a new Validator instance with a custom logger.
func NewWithLogger(l simplelogger.SimpleLoggerInterface) Validator {
	v := validator.New()
	_ = v.RegisterValidation("env", validateEnvVar)
	_ = v.RegisterValidation("resource-name", validateResourceName)
	return Validator{l, v}
}

// ParseFile parse a Krt file from the given filename that must exists on the filesystem.
func (v *Validator) ParseFile(yamlFile string) (*krt.File, error) {
	reader, err := os.Open(yamlFile)
	if err != nil {
		return nil, fmt.Errorf("error reading file %s: %w", yamlFile, err)
	}

	return v.Parse(reader)
}

// Parse parse a Krt file from the given Reader.
func (v *Validator) Parse(r io.Reader) (*krt.File, error) {
	var file krt.File

	krtYmlFile, err := ioutil.ReadAll(r)
	if err != nil {
		return nil, fmt.Errorf("error reading content: %w", err)
	}

	err = yaml.Unmarshal(krtYmlFile, &file)
	if err != nil {
		return nil, fmt.Errorf("error Unmarshal yaml file: %w", err)
	}

	return &file, nil
}

// Validate check Krt structure compliance and reference between nodes and workflows.
func (v *Validator) Validate(file *krt.File) error {
	v.log("Validating KRT file")

	vErr := v.validator.Struct(file)
	if _, ok := vErr.(*validator.InvalidValidationError); ok {
		return ValidationErrors{vErr}
	}

	if vErr != nil {
		if errs, ok := vErr.(validator.ValidationErrors); ok {
			details := "the krt.yml file contains the following validation errors:"
			hasResNameErr := false

			for _, e := range errs {
				location := strings.Replace(e.Namespace(), "Krt.", "", 1)
				switch e.Tag() {
				case "required":
					details += fmt.Sprintf("\n  - The field \"%s\" is required", location)
				case "lt":
					details += fmt.Sprintf("\n  - Invalid length \"%s\" at \"%s\" must be lower than %s", e.Value(), location, e.Param())
				case "lte":
					details += fmt.Sprintf("\n  - Invalid length \"%s\" at \"%s\" must be lower or equal than %s", e.Value(), location, e.Param())
				case "gt":
					details += fmt.Sprintf("\n  - Invalid length \"%s\" at \"%s\" must be greater than %s", e.Value(), location, e.Param())
				case "gte":
					details += fmt.Sprintf("\n  - Invalid length \"%s\" at \"%s\" must be greater or equal than %s", e.Value(), location, e.Param())
				case "resource-name":
					details += fmt.Sprintf("\n  - Invalid resource name \"%s\" at \"%s\"", e.Value(), location)
					hasResNameErr = true
				default:
					details += fmt.Sprintf("\n  - %s", e)
				}
			}

			if hasResNameErr {
				details += "\nresource names must contain only lowercase alphanumeric characters or '-', e.g. my-resource-name."
			}

			return ValidationErrors{errors.New(details)}
		}
	}

	v.log("Validating KRT workflows")

	var allErr ValidationErrors

	errs := validateWorkflows(file)
	if errs != nil {
		allErr = append(allErr, fmt.Errorf("error validating KRT workflows: %w", errs))
	}

	v.log("Validating KRT image names")

	errs = validateImages(file)
	if errs != nil {
		allErr = append(allErr, fmt.Errorf("error validating KRT images: %w", errs))
	}

	if len(allErr) > 0 {
		return allErr
	}

	return nil
}

// ValidateContent checks Krt file references exists on the filesystem.
func (v *Validator) ValidateContent(file *krt.File, rootDir string) error {
	v.log("Validating KRT src paths")

	return validateSrcPaths(file, rootDir)
}

func validateImages(krt *krt.File) ValidationErrors {
	var errs []error = nil

	_, err := reference.Parse(krt.Entrypoint.Image)
	if err != nil {
		errs = append(errs, fmt.Errorf("entrypoint image error: %w", err))
	}

	for _, node := range krt.Nodes {
		_, err := reference.Parse(node.Image)
		if err != nil {
			errs = append(errs, fmt.Errorf("node image error: %w", err))
		}
	}

	return errs
}

func validateWorkflows(k *krt.File) ValidationErrors {
	var errs ValidationErrors = nil

	nodeList := map[string]int{}
	for _, node := range k.Nodes {
		nodeList[node.Name] = 1
	}

	for _, workflow := range k.Workflows {
		for _, nodeName := range workflow.Sequential {
			if _, ok := nodeList[nodeName]; !ok {
				errs = append(errs, fmt.Errorf("node in sequential not found: %s", nodeName)) // nolint: goerr113
			}
		}
	}

	return errs
}

func (v *Validator) log(msg string) {
	v.logger.Info(msg)
}

func validateSrcPaths(file *krt.File, rootDir string) error {
	var errs ValidationErrors = nil

	for _, node := range file.Nodes {
		nodeFile := path.Join(rootDir, node.Src)
		if !fileExists(nodeFile) {
			errs = append(errs, fmt.Errorf("error src File %s for node %s not exists", node.Src, node.Name)) // nolint: goerr113
		}
	}

	if len(errs) > 0 {
		return errs
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

func validateResourceName(fl validator.FieldLevel) bool {
	return reResourceName.MatchString(fl.Field().String())
}

func validateEnvVar(fl validator.FieldLevel) bool {
	return reEnvVar.MatchString(fl.Field().String())
}
