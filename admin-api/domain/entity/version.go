package entity

import (
	"time"
)

type Edge struct {
	ID       string `bson:"id"`
	FromNode string `bson:"fromNode"`
	ToNode   string `bson:"toNode"`
}

type Node struct {
	ID     string `bson:"id"`
	Name   string `bson:"name"`
	Image  string `bson:"image"`
	Src    string `bson:"src"`
	Status string `bson:"status"`
}

type Workflow struct {
	Name       string `bson:"name"`
	Entrypoint string `bson:"entrypoint"`
	Nodes      []Node `bson:"nodes"`
	Edges      []Edge `bson:"edges"`
}

type Entrypoint struct {
	ProtoFile string `bson:"proto"`
	Image     string `bson:"image"`
	Src       string `bson:"src"`
}

type Version struct {
	ID        string `bson:"_id"`
	RuntimeID string `bson:"runtimeId"`

	Name        string `bson:"name"`
	Description string `bson:"description"`

	CreationDate   time.Time `bson:"creationDate"`
	CreationAuthor string    `bson:"creationAuthor"`

	ActivationDate   *time.Time `bson:"activationDate"`
	ActivationUserID *string    `bson:"activationUserId"`

	Status string `bson:"status"`

	Entrypoint Entrypoint `bson:"entrypoint"`
	Workflows  []Workflow `bson:"workflows"`
}
