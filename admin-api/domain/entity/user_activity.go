package entity

import (
	"time"
)

type UserActivityVar struct {
	Key   string `bson:"key"`
	Value string `bson:"value"`
}

type UserActivity struct {
	ID   string             `bson:"_id"`
	Date time.Time          `bson:"date"`
	User User               `bson:"user"`
	Type string             `bson:"type"`
	Vars []*UserActivityVar `bson:"vars"`
}
