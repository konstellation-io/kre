package entity

import "time"

type AccessLevel string

const (
	AccessLevelViewer  AccessLevel = "VIEWER"
	AccessLevelManager AccessLevel = "MANAGER"
	AccessLevelAdmin   AccessLevel = "ADMIN"
)

func (e AccessLevel) IsValid() bool {
	switch e {
	case AccessLevelViewer, AccessLevelManager, AccessLevelAdmin:
		return true
	}
	return false
}

func (e AccessLevel) String() string {
	return string(e)
}

type User struct {
	ID           string      `bson:"_id"`
	Email        string      `bson:"email"`
	AccessLevel  AccessLevel `bson:"accessLevel"`
	CreationDate time.Time   `bson:"creationDate"`
	LastActivity *time.Time  `bson:"lastActivity"`
	Deleted      bool        `bson:"deleted"`
	ApiTokens    []*ApiToken `bson:"apiTokens"`
}

type ApiToken struct {
	Id           string     `bson:"_id"`
	Name         string     `bson:"name"`
	CreationDate time.Time  `bson:"creationDate"`
	LastActivity *time.Time `bson:"lastActivity"`
	Token        string     `bson:"token"`
}
