package krt

import (
	"github.com/go-playground/validator/v10"
	"regexp"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
	validate.RegisterValidation("resource-name", ValidateResourceName)
	validate.RegisterValidation("env", ValidateEnvVar)

}

func (k *Krt) GetValidator() *validator.Validate {
	return validate
}

func ValidateResourceName(fl validator.FieldLevel) bool {
	var matchVersionName = regexp.MustCompile("^[a-z0-9]([-a-z0-9]*[a-z0-9])?$")
	return matchVersionName.MatchString(fl.Field().String())
}

func ValidateEnvVar(fl validator.FieldLevel) bool {
	var matchVersionName = regexp.MustCompile("^A-Z0-9]([_A-Z0-9]*[A-Z0-9])?$")
	return matchVersionName.MatchString(fl.Field().String())
}
