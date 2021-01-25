package entity

import (
	"time"
)

type Runtime struct {
	ID           string    `bson:"_id" validate:"required"`
	Name         string    `bson:"name" validate:"required,lte=40"`
	Description  string    `bson:"description" validate:"required,lte=500"`
	CreationDate time.Time `bson:"creationDate"`
}
