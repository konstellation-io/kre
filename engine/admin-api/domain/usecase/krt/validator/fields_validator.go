package validator

import (
	"errors"
	"fmt"
	"os"
	"path"
	"regexp"
	"strings"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"

	"github.com/go-playground/validator/v10"
)

//go:generate mockgen -source=${GOFILE} -destination=../../../../mocks/${GOFILE} -package=mocks

var krtValidator *validator.Validate

func init() {
	krtValidator = validator.New()

	// register validator for resource names. Ex: name-valid123
	reResourceName := regexp.MustCompile("^[a-z0-9]([-a-z0-9]*[a-z0-9])?$")
	_ = krtValidator.RegisterValidation("resource-name", func(fl validator.FieldLevel) bool {
		return reResourceName.MatchString(fl.Field().String())
	})

	// register validator for env var names. Ex: NAME_VALID123
	reEnvVar := regexp.MustCompile("^[A-Z0-9]([_A-Z0-9]*[A-Z0-9])?$")
	_ = krtValidator.RegisterValidation("env", func(fl validator.FieldLevel) bool {
		return reEnvVar.MatchString(fl.Field().String())
	})

	_ = krtValidator.RegisterValidation("krt-version", func(fl validator.FieldLevel) bool {
		_, ok := entity.ParseKRTVersionFromString(fl.Field().String())
		return ok
	})
}

type FieldsValidator interface {
	Run(yaml interface{}) []error
}

type YamlFieldsValidator struct {
	validator *validator.Validate
}

func NewYamlFieldsValidator() *YamlFieldsValidator {
	return &YamlFieldsValidator{
		validator: krtValidator,
	}
}

func (k *YamlFieldsValidator) Run(yaml interface{}) []error {
	err := k.validator.Struct(yaml)
	return k.getErrorMessages(err)
}

func (k *YamlFieldsValidator) getErrorMessages(err error) []error {
	if err == nil {
		return nil
	}
	if errs, ok := err.(validator.ValidationErrors); ok {
		hasResNameErr := false
		var errorMessages []error

		for _, e := range errs {
			location := strings.Replace(e.Namespace(), "Krt.", "", 1)
			switch e.Tag() {
			case "required":
				errorMessages = append(errorMessages, fmt.Errorf("the field \"%s\" is required", location))
			case "lt":
				errorMessages = append(errorMessages, fmt.Errorf("invalid length \"%s\" at \"%s\" must be lower than %s", e.Value(), location, e.Param()))
			case "lte":
				errorMessages = append(errorMessages, fmt.Errorf("invalid length \"%s\" at \"%s\" must be lower or equal than %s", e.Value(), location, e.Param()))
			case "gt":
				errorMessages = append(errorMessages, fmt.Errorf("invalid length \"%s\" at \"%s\" must be greater than %s", e.Value(), location, e.Param()))
			case "gte":
				errorMessages = append(errorMessages, fmt.Errorf("invalid length \"%s\" at \"%s\" must be greater or equal than %s", e.Value(), location, e.Param()))
			case "resource-name":
				errorMessages = append(errorMessages, fmt.Errorf("invalid resource name \"%s\" at \"%s\"", e.Value(), location))
				hasResNameErr = true
			case "endswith":
				errorMessages = append(errorMessages, fmt.Errorf("invalid value \"%s\" at \"%s\" must end with %s", e.Value(), location, e.Param()))
			case "env":
				errorMessages = append(errorMessages, fmt.Errorf("invalid value \"%s\" at env var \"%s\" must contain only capital letters, numbers, and underscores", e.Value(), location))
			case "krt-version":
				errorMessages = append(errorMessages, fmt.Errorf("invalid value \"%s\" at krtVersion \"%s\"", e.Value(), location))
			default:
				errorMessages = append(errorMessages, fmt.Errorf("%s", e))
			}
		}
		if hasResNameErr {
			errorMessages = append(errorMessages, errors.New("the resource names must contain only lowercase alphanumeric characters or '-', e.g. my-resource-name"))
		}
		return errorMessages
	}
	return []error{errors.New("internal error parsing fields validator error messages")}
}

func ValidateSrcPaths(krt *krt.Krt, dstDir string) []error {
	var errors []error = nil
	for _, workflow := range krt.Workflows {
		for _, node := range workflow.Nodes {
			nodeFile := path.Join(dstDir, node.Src)
			if !fileExists(nodeFile) {
				errors = append(errors, fmt.Errorf("error src file \"%s\" for node \"%s\" does not exists ", node.Src, node.Name))
			}
		}
	}

	return errors
}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}
