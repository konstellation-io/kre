package validator_test

import (
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"
)

type KrtBuilder struct {
	krtYaml *krt.Krt
}

func NewKrtBuilder() *KrtBuilder {
	return &KrtBuilder{
		krtYaml: &krt.Krt{
			KrtVersion:  entity.KRTVersionV2.String(),
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
					Exitpoint:  "test-node",
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
			},
		},
	}
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

func (k *KrtBuilder) WithWorkflows(workflows []krt.Workflow) *KrtBuilder {
	k.krtYaml.Workflows = workflows
	return k
}

func (k *KrtBuilder) WithWorkflowsNodes(nodes []krt.Node) *KrtBuilder {
	k.krtYaml.Workflows[0].Nodes = nodes
	return k
}

func (k *KrtBuilder) WithWorkflowsExitpoint(exitpoint string) *KrtBuilder {
	k.krtYaml.Workflows[0].Exitpoint = exitpoint
	return k
}

func (k *KrtBuilder) Build() *krt.Krt {
	return k.krtYaml
}
