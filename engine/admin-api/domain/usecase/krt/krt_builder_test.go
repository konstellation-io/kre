package krt_test

import (
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"
)

type KrtBuilder struct {
	krtYaml *krt.Krt
}

func NewKrtBuilder() *KrtBuilder {
	return &KrtBuilder{
		krtYaml: &krt.Krt{
			Version:     "version-name",
			Description: "Test description",
			Entrypoint: krt.Entrypoint{
				Proto: "valid.proto",
				Image: "test/image",
			},
			Config: krt.Config{
				Variables: []string{"TEST_VAR"},
				Files:     []string{"test_file"},
			},
			Workflows: []krt.Workflow{
				{
					Name:       "valid-workflow",
					Entrypoint: "valid-entrypoint",
				},
			},
		},
	}
}

func (k *KrtBuilder) V1() *KrtBuilder {
	k.krtYaml.KrtVersion = krt.VersionV1
	k.krtYaml.Nodes = []krt.Node{
		{
			Name:  "test-node",
			Image: "test/image",
			Src:   "src/test",
			GPU:   false,
		},
	}
	k.krtYaml.Workflows = []krt.Workflow{
		{
			Name:       "valid-workflow",
			Entrypoint: "valid-entrypoint",
			Sequential: []string{"test-node"},
		},
	}
	return k
}

func (k *KrtBuilder) V2() *KrtBuilder {
	k.krtYaml.KrtVersion = krt.VersionV2
	k.krtYaml.Workflows = []krt.Workflow{
		{
			Name:       "valid-workflow",
			Entrypoint: "valid-entrypoint",
			Nodes: []krt.Node{
				{
					Name:          "test-node",
					Image:         "test/image",
					Src:           "src/test",
					GPU:           false,
					Subscriptions: []string{"entrypoint"},
				},
			},
		},
	}

	return k
}

func (k *KrtBuilder) WithKrtVersion(krtVersion string) *KrtBuilder {
	k.krtYaml.KrtVersion = krtVersion
	return k
}

func (k *KrtBuilder) WithVersion(version string) *KrtBuilder {
	k.krtYaml.Version = version
	return k
}

func (k *KrtBuilder) WithDescription(description string) *KrtBuilder {
	k.krtYaml.Description = description
	return k
}

func (k *KrtBuilder) WithEntrypoint(entrypoint krt.Entrypoint) *KrtBuilder {
	k.krtYaml.Entrypoint = entrypoint
	return k
}

func (k *KrtBuilder) WithEntrypointProto(proto string) *KrtBuilder {
	k.krtYaml.Entrypoint.Proto = proto
	return k
}

func (k *KrtBuilder) WithEntrypointImage(image string) *KrtBuilder {
	k.krtYaml.Entrypoint.Image = image
	return k
}

func (k *KrtBuilder) WithConfigVars(vars []string) *KrtBuilder {
	k.krtYaml.Config.Variables = vars
	return k
}

func (k *KrtBuilder) WithNodes(nodes []krt.Node) *KrtBuilder {
	k.krtYaml.Nodes = nodes
	return k
}

func (k *KrtBuilder) WithWorkflows(workflows []krt.Workflow) *KrtBuilder {
	k.krtYaml.Workflows = workflows
	return k
}

func (k *KrtBuilder) WithWorkflowsSequential(sequential []string) *KrtBuilder {
	k.krtYaml.Workflows[0].Sequential = sequential
	return k
}

func (k *KrtBuilder) WithWorkflowsNodes(nodes []krt.Node) *KrtBuilder {
	k.krtYaml.Workflows[0].Nodes = nodes
	return k
}

func (k *KrtBuilder) Build() *krt.Krt {
	return k.krtYaml
}
