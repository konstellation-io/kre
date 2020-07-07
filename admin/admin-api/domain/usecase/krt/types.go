package krt

// Krt contains data about a version
type Krt struct {
	Version     string     `yaml:"version" validate:"required,resource-name,gt=1,lt=20"`
	Description string     `yaml:"description" validate:"required"`
	Entrypoint  Entrypoint `yaml:"entrypoint" validate:"required"`
	Config      Config     `yaml:"config" validate:"required"`
	Nodes       []Node     `yaml:"nodes" validate:"required,dive,min=1"`
	Workflows   []Workflow `yaml:"workflows" validate:"required,dive,min=1"`
}

// Node contains data about a version's node
type Node struct {
	Name  string `yaml:"name" validate:"required,resource-name,gt=1,lt=20"`
	Image string `yaml:"image" validate:"required"`
	Src   string `yaml:"src" validate:"required"`
}

// Workflow contains data about a version's workflow
type Workflow struct {
	Name       string   `yaml:"name" validate:"required,resource-name,gt=1,lt=20"`
	Entrypoint string   `yaml:"entrypoint" validate:"required"`
	Sequential []string `yaml:"sequential" validate:"required"`
}

type Entrypoint struct {
	Proto string `yaml:"proto" validate:"required,endswith=.proto"`
	Image string `yaml:"image" validate:"required"`
}

type Config struct {
	Variables []string `yaml:"variables" validate:"dive,env"`
	Files     []string `yaml:"files"`
}
