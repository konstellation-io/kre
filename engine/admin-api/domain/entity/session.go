package entity

import "time"

type Session struct {
	ID             string    `bson:"_id"`
	UserID         string    `bson:"userId"`
	Token          string    `bson:"token"`
	CreationDate   time.Time `bson:"creationDate"`
	ExpirationDate time.Time `bson:"expirationDate"`
}
