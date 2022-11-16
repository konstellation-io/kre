package krt

import "github.com/konstellation-io/kre/engine/admin-api/domain/entity"

// Krt contains data about a version
type Krt struct {
	KrtVersion  string     `yaml:"krtVersion" validate:"omitempty,krt-version"`
	Version     string     `yaml:"version" validate:"required,resource-name,lt=20"`
	Description string     `yaml:"description" validate:"required"`
	Entrypoint  Entrypoint `yaml:"entrypoint" validate:"required"`
	Config      Config     `yaml:"config" validate:"required"`
	Nodes       []Node     `yaml:"nodes" validate:"excluded_unless=krtVersion v1,dive,min=1"` // TODO krt-v1: deprecate retrocompatibility
	Workflows   []Workflow `yaml:"workflows" validate:"required,dive,min=1"`
}

// Node contains data about a version's node
type Node struct {
	Name          string   `yaml:"name" validate:"required,resource-name,lt=20"`
	Image         string   `yaml:"image" validate:"required"`
	Src           string   `yaml:"src" validate:"required"`
	GPU           bool     `yaml:"gpu"`
	Subscriptions []string `yaml:"subscriptions"` //v2
}

// Workflow contains data about a version's workflow
type Workflow struct {
	Name       string   `yaml:"name" validate:"required,resource-name,lt=20"`
	Entrypoint string   `yaml:"entrypoint" validate:"required"`
	Sequential []string `yaml:"sequential"`            // TODO krt-v1: deprecate retrocompatibility
	Nodes      []Node   `yaml:"nodes" validate:"dive"` //v2
	Exitpoint  string   `yaml:"exitpoint"`             //v2, once v1 deprecated make required
}

type Entrypoint struct {
	Proto string `yaml:"proto" validate:"required,endswith=.proto"`
	Image string `yaml:"image" validate:"required"`
}

type Config struct {
	Variables []string `yaml:"variables" validate:"dive,env"`
	Files     []string `yaml:"files"`
}

func (k Krt) IsKrtVersionV1() bool { // TODO krt-v1: deprecate retrocompatibility
	return k.KrtVersion == "" || k.KrtVersion == entity.KRTVersionV1.String()
}
