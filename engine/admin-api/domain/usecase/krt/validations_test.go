package krt_test

import (
	"testing"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"
	"github.com/stretchr/testify/assert"
)

func TestYamlValuesValidator_Run(t *testing.T) {
	tests := []struct {
		name        string
		krtYaml     interface{}
		wantError   bool
		errorString string
	}{
		{
			name:        "KRT YAML values successfully validated",
			krtYaml:     NewKrtBuilder().V1().Build(),
			wantError:   false,
			errorString: "",
		},
		{
			name:        "KRT YAML invalid version name",
			krtYaml:     NewKrtBuilder().V1().WithVersion("this version name length is higher than the maximum").Build(),
			wantError:   true,
			errorString: "Key: 'Krt.Version' Error:Field validation for 'Version' failed on the 'resource-name' tag",
		},
		{
			name:        "KRT YAML without required description",
			krtYaml:     NewKrtBuilder().V1().WithDescription("").Build(),
			wantError:   true,
			errorString: "Key: 'Krt.Description' Error:Field validation for 'Description' failed on the 'required' tag",
		},
		{
			name:        "KRT YAML with invalid proto in entrypoint",
			krtYaml:     NewKrtBuilder().V1().WithEntrypointProto("invalid").Build(),
			wantError:   true,
			errorString: "Key: 'Krt.Entrypoint.Proto' Error:Field validation for 'Proto' failed on the 'endswith' tag",
		},
		{
			name:        "KRT YAML without required proto in entrypoint",
			krtYaml:     NewKrtBuilder().V1().WithEntrypointProto("").Build(),
			wantError:   true,
			errorString: "Key: 'Krt.Entrypoint.Proto' Error:Field validation for 'Proto' failed on the 'required' tag",
		},
		{
			name:        "KRT YAML without required image in entrypoint",
			krtYaml:     NewKrtBuilder().V1().WithEntrypointImage("").Build(),
			wantError:   true,
			errorString: "Key: 'Krt.Entrypoint.Image' Error:Field validation for 'Image' failed on the 'required' tag",
		},
		{
			name:        "KRT YAML with invalid vars in config",
			krtYaml:     NewKrtBuilder().V1().WithConfigVars([]string{"invalid-var"}).Build(),
			wantError:   true,
			errorString: "Key: 'Krt.Config.Variables[0]' Error:Field validation for 'Variables[0]' failed on the 'env' tag",
		},
		{
			name:        "KRT YAML with invalid KRT Version",
			krtYaml:     NewKrtBuilder().WithKrtVersion("invalid-version").Build(),
			wantError:   true,
			errorString: "Key: 'Krt.KrtVersion' Error:Field validation for 'KrtVersion' failed on the 'krt-version' tag",
		},
		{
			name:        "sequential field is incompatible with KrtVersion v2",
			krtYaml:     NewKrtBuilder().V2().WithWorkflowsSequential([]string{"afd"}).Build(),
			wantError:   true,
			errorString: "Key: 'Krt.workflows[0].sequential' Error:Field validation for 'workflows[0].sequential' failed on the 'v2-workflows' tag",
		},
		{
			name: "subscribe field is incompatible with KrtVersion v1",
			krtYaml: NewKrtBuilder().V1().WithNodes([]krt.Node{
				{
					Name:          "test-node",
					Image:         "test-image",
					Src:           "test-src",
					GPU:           false,
					Subscriptions: []string{"node-a"},
				},
			}).Build(),
			wantError:   true,
			errorString: "Key: 'Krt.nodes[0].subscriptions' Error:Field validation for 'nodes[0].subscriptions' failed on the 'v1-nodes' tag",
		},
		{
			name: "subscribe field is required with KrtVersion v2",
			krtYaml: NewKrtBuilder().V2().WithWorkflowsNodes([]krt.Node{
				{
					Name:  "node-b",
					Image: "test-image",
					Src:   "test-src",
				},
			}).Build(),
			wantError:   true,
			errorString: "Key: 'Krt.workflows[0].nodes[0].subscriptions' Error:Field validation for 'workflows[0].nodes[0].subscriptions' failed on the 'v2-workflows' tag",
		},
		{
			name: "a node is at least subscribed to another in v2",
			krtYaml: NewKrtBuilder().V2().WithWorkflowsNodes([]krt.Node{
				{
					Name:          "test-node",
					Image:         "test-image",
					Src:           "test-src",
					GPU:           false,
					Subscriptions: []string{},
				},
			}).Build(),
			wantError:   true,
			errorString: "Key: 'Krt.workflows[0].nodes[0].subscriptions' Error:Field validation for 'workflows[0].nodes[0].subscriptions' failed on the 'v2-workflows' tag",
		},
		{
			name: "workflows nodes field is incompatible with KrtVersion v1",
			krtYaml: NewKrtBuilder().V1().WithWorkflowsNodes([]krt.Node{
				{
					Name:  "node-b",
					Image: "test-image",
					Src:   "test-src",
				},
			}).Build(),
			wantError:   true,
			errorString: "Key: 'Krt.nodes' Error:Field validation for 'nodes' failed on the 'v1-workflows' tag",
		},
		{
			name: "subscribe field is required with KrtVersion v2",
			krtYaml: NewKrtBuilder().V2().WithWorkflowsNodes([]krt.Node{
				{
					Name:  "node-b",
					Image: "test-image",
					Src:   "test-src",
				},
			}).Build(),
			wantError:   true,
			errorString: "Key: 'Krt.workflows[0].nodes[0].subscriptions' Error:Field validation for 'workflows[0].nodes[0].subscriptions' failed on the 'v2-workflows' tag",
		},
		{
			name:        "a workflows sequential definitions has at least one node v1",
			krtYaml:     NewKrtBuilder().V1().WithWorkflowsSequential([]string{}).Build(),
			wantError:   true,
			errorString: "Key: 'Krt.workflows[0].sequential' Error:Field validation for 'workflows[0].sequential' failed on the 'v1-workflows' tag",
		},
	}

	valuesValidator := krt.NewYamlValuesValidator()

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			err := valuesValidator.Run(tc.krtYaml)
			if tc.wantError {
				assert.EqualError(t, err, tc.errorString)
				return
			}
			assert.NoError(t, err)
		})
	}
}
