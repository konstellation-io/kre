package entity

import "time"

type Token struct {
	Code      string
	UID       string
	ExpiresAt time.Time
}
