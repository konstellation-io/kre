package entity

import (
	"time"

	"github.com/go-playground/validator/v10"
)

//nolint:gochecknoglobals // validate have to be a global variable.
var (
	validate = validator.New()
)

type Product struct {
	ID               string    `bson:"_id" validate:"required"`
	Name             string    `bson:"name" validate:"required,lte=40"`
	Description      string    `bson:"description" validate:"required,lte=500"`
	CreationDate     time.Time `bson:"creationDate"`
	Owner            string    `bson:"owner"`
	PublishedVersion string    `bson:"publishedVersion"`
}

func (r *Product) Validate() error {
	return validate.Struct(r)
}
