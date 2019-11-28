package entity

type Setting struct {
	SessionLifetimeInDays int `bson:"sessionLifetimeInDays"`
}
