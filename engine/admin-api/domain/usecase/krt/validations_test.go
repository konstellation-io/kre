package krt_test

import (
	"testing"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"
	"github.com/stretchr/testify/assert"
)

const (
	validVersionName   = "test"
	invalidVersionName = "this version name length is higher than the maximum"
	validDescription   = "Test description"
	validProto         = "valid.proto"
	invalidProto       = "invalid"
)

var (
	validEntrypoint = krt.Entrypoint{
		Proto: validProto,
		Image: "validImage",
	}
	invalidProtoEntrypoint = krt.Entrypoint{
		Proto: invalidProto,
		Image: "validImage",
	}
	invalidEntrypointWithoutProto = krt.Entrypoint{
		Image: "validImage",
	}
	invalidEntrypointWithoutImage = krt.Entrypoint{
		Proto: validProto,
	}
	validConfigVars   = []string{"VALID_VAR"}
	invalidConfigVars = []string{"invalid_var"}
	validConfig       = krt.Config{
		Variables: validConfigVars,
		Files:     nil,
	}
	invalidVarsConfig = krt.Config{
		Variables: invalidConfigVars,
		Files:     nil,
	}
	validNodes     = []krt.Node{}
	validWorkflows = []krt.Workflow{}
)

func TestYamlValuesValidator_Run(t *testing.T) {
	tests := []struct {
		name        string
		krtYaml     interface{}
		wantError   bool
		errorString string
	}{
		{
			name: "KRT YAML values successfully validated",
			krtYaml: &krt.Krt{
				Version:     validVersionName,
				Description: validDescription,
				Entrypoint:  validEntrypoint,
				Config:      validConfig,
				Nodes:       validNodes,
				Workflows:   validWorkflows,
			},
			wantError:   false,
			errorString: "",
		},
		{
			name: "KRT YAML invalid version name",
			krtYaml: &krt.Krt{
				Version:     invalidVersionName,
				Description: validDescription,
				Entrypoint:  validEntrypoint,
				Config:      validConfig,
				Nodes:       validNodes,
				Workflows:   validWorkflows,
			},
			wantError:   true,
			errorString: "Key: 'Krt.Version' Error:Field validation for 'Version' failed on the 'resource-name' tag",
		},
		{
			name: "KRT YAML without required description",
			krtYaml: &krt.Krt{
				Version:    validVersionName,
				Entrypoint: validEntrypoint,
				Config:     validConfig,
				Nodes:      validNodes,
				Workflows:  validWorkflows,
			},
			wantError:   true,
			errorString: "Key: 'Krt.Description' Error:Field validation for 'Description' failed on the 'required' tag",
		},
		{
			name: "KRT YAML with invalid proto in entrypoint",
			krtYaml: &krt.Krt{
				Version:     validVersionName,
				Description: validDescription,
				Entrypoint:  invalidProtoEntrypoint,
				Config:      validConfig,
				Nodes:       validNodes,
				Workflows:   validWorkflows,
			},
			wantError:   true,
			errorString: "Key: 'Krt.Entrypoint.Proto' Error:Field validation for 'Proto' failed on the 'endswith' tag",
		},
		{
			name: "KRT YAML without required proto in entrypoint",
			krtYaml: &krt.Krt{
				Version:     validVersionName,
				Description: validDescription,
				Entrypoint:  invalidEntrypointWithoutProto,
				Config:      validConfig,
				Nodes:       validNodes,
				Workflows:   validWorkflows,
			},
			wantError:   true,
			errorString: "Key: 'Krt.Entrypoint.Proto' Error:Field validation for 'Proto' failed on the 'required' tag",
		},
		{
			name: "KRT YAML without required image in entrypoint",
			krtYaml: &krt.Krt{
				Version:     validVersionName,
				Description: validDescription,
				Entrypoint:  invalidEntrypointWithoutImage,
				Config:      validConfig,
				Nodes:       validNodes,
				Workflows:   validWorkflows,
			},
			wantError:   true,
			errorString: "Key: 'Krt.Entrypoint.Image' Error:Field validation for 'Image' failed on the 'required' tag",
		},
		{
			name: "KRT YAML with invalid vars in config",
			krtYaml: &krt.Krt{
				Version:     validVersionName,
				Description: validDescription,
				Entrypoint:  validEntrypoint,
				Config:      invalidVarsConfig,
				Nodes:       validNodes,
				Workflows:   validWorkflows,
			},
			wantError:   true,
			errorString: "Key: 'Krt.Config.Variables[0]' Error:Field validation for 'Variables[0]' failed on the 'env' tag",
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
