package entity

import (
	"time"
)

type Version struct {
	ID        string `bson:"_id"`
	RuntimeID string `bson:"runtimeId"`

	Name        string `bson:"name"`
	Description string `bson:"description"`

	CreationDate   time.Time `bson:"creationDate"`
	CreationAuthor string    `bson:"creationAuthor"`

	ActivationDate   time.Time `bson:"activationDate"`
	ActivationUserID string    `bson:"activationUserId"`

	Status string `bson:"status"`
}
