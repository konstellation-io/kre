package krt

// File contains data about a version.
type File struct {
	KrtVersion  string     `yaml:"krtVersion,omitempty" validate:"omitempty"`
	Version     string     `yaml:"version" validate:"required,resource-name,lt=20"`
	Description string     `yaml:"description" validate:"required"`
	Entrypoint  Entrypoint `yaml:"entrypoint" validate:"required"`
	Config      Config     `yaml:"config" validate:"required"`
	Nodes       []Node     `yaml:"nodes,omitempty" validate:"omitempty,dive,min=1"`
	Workflows   []Workflow `yaml:"workflows" validate:"required,dive,min=1"`
}

// Node contains data about a version's node.
type Node struct {
	Name          string   `yaml:"name" validate:"required,resource-name,lt=20"`
	Image         string   `yaml:"image" validate:"required"`
	Src           string   `yaml:"src" validate:"required"`
	GPU           bool     `yaml:"gpu"`
	Subscriptions []string `yaml:"subscriptions,omitempty"` //v2
}

// Workflow contains data about a version's workflow.
type Workflow struct {
	Name       string   `yaml:"name" validate:"required,resource-name,lt=20"`
	Entrypoint string   `yaml:"entrypoint" validate:"required"`
	Sequential []string `yaml:"sequential,omitempty"`
	Nodes      []Node   `yaml:"nodes,omitempty" validate:"dive"` //v2
	Exitpoint  string   `yaml:"exitpoint,omitempty"`             //v2, once v1 deprecated make required
}

// Entrypoint defines a KRT entrypoint Image and Proto file.
type Entrypoint struct {
	Image string `yaml:"image" validate:"required"`
	Proto string `yaml:"proto" validate:"required,endswith=.proto"`
}

// Config contains variables and file names.
type Config struct {
	Variables []string `yaml:"variables" validate:"dive,env"`
	Files     []string `yaml:"files" validate:"dive,env"`
}
