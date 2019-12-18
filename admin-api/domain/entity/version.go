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
	Status string `bson:"status"`
}

type Workflow struct {
	Name  string `bson:"name"`
	Nodes []Node `bson:"nodes"`
	Edges []Edge `bson:"edges"`
}

type Version struct {
	ID        string `bson:"_id"`
	RuntimeID string `bson:"runtimeId"`

	Name        string `bson:"name"`
	Description string `bson:"description"`

	CreationDate   time.Time `bson:"creationDate"`
	CreationAuthor string    `bson:"creationAuthor"`

	ActivationDate   time.Time `bson:"activationDate"`
	ActivationUserID string    `bson:"activationUserId"`

	Status    string     `bson:"status"`
	Workflows []Workflow `bson:"workflows"`
}
