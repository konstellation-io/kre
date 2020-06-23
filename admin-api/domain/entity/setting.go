package entity

type Settings struct {
	SessionLifetimeInDays int      `bson:"sessionLifetimeInDays"`
	AuthAllowedDomains    []string `bson:"authAllowedDomains"`
}
