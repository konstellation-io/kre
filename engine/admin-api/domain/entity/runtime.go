package entity

import (
	"log"
	"regexp"
	"time"

	"github.com/go-playground/validator/v10"
)

type RuntimeStatus string

const (
	RuntimeStatusCreating RuntimeStatus = "CREATING"
	RuntimeStatusStarted  RuntimeStatus = "STARTED"
	RuntimeStatusError    RuntimeStatus = "ERROR"
)

var (
	validate             = validator.New()
	validRuntimeIDRegExp = regexp.MustCompile("^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$")
)

func init() {
	err := validate.RegisterValidation("runtime-id", runtimeIDValidator)
	if err != nil {
		log.Fatal(err)
	}
}

func runtimeIDValidator(fl validator.FieldLevel) bool {
	return validRuntimeIDRegExp.MatchString(fl.Field().String())
}

func (e RuntimeStatus) IsValid() bool {
	switch e {
	case RuntimeStatusCreating, RuntimeStatusStarted, RuntimeStatusError:
		return true
	}
	return false
}

func (e RuntimeStatus) String() string {
	return string(e)
}

type RuntimeStatusEntity struct {
	Name   string
	Status string
}

type Runtime struct {
	ID               string        `bson:"_id" validate:"required"`
	Name             string        `bson:"name" validate:"required,lte=40"`
	Description      string        `bson:"description" validate:"required,lte=500"`
	PublishedVersion string        `bson:"publishedVersion"`
	CreationDate     time.Time     `bson:"creationDate"`
	Status           RuntimeStatus `bson:"status"`
	Owner            string        `bson:"owner"`
}

func (r *Runtime) Validate() error {
	return validate.Struct(r)
}
