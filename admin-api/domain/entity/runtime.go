package entity

import (
	"time"
)

type Runtime struct {
	ID           string    `bson:"_id"`
	Name         string    `bson:"name"`
	CreationDate time.Time `bson:"creationDate"`
	Owner        string    `bson:"owner"`
	Status       string    `bson:"status"`
}
