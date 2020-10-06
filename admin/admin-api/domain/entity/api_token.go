package entity

import (
	"time"
)

type APIToken struct {
	ID           string     `bson:"_id"`
	Name         string     `bson:"name"`
	UserID       string     `bson:"userId"`
	Hash         string     `bson:"hash"`
	CreationDate time.Time  `bson:"creationDate"`
	LastActivity *time.Time `bson:"lastActivity"`
}
