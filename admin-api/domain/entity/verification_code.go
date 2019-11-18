package entity

import "time"

type VerificationCode struct {
	Code      string    `bson:"code"`
	UID       string    `bson:"uid"`
	ExpiresAt time.Time `bson:"expiresAt"`
}
