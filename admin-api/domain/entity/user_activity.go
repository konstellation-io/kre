package entity

import (
	"time"
)

type UserActivity struct {
	ID      string    `bson:"_id"`
	Date    time.Time `bson:"date"`
	User    User      `bson:"user"`
	Type    string    `bson:"type"`
	Message string    `bson:"message"`
}
