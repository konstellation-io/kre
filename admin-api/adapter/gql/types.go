package gql

import "github.com/graph-gophers/graphql-go"

type User struct {
	Id       graphql.ID
	Email    string
	Disabled *bool
}

type Version struct {
	Id             graphql.ID
	VersionNumber  string
	Description    *string
	Status         string
	CreationDate   string
	CreatorName    string
	ActivationDate string
	ActivatorName  string
}

type Runtime struct {
	Id           graphql.ID
	Name         string
	Status       string
	CreationDate string
	Versions     *[]*Version
}

type RuntimeUpdateResponse struct {
	Success bool
	Message *string
	Runtime *Runtime
}
