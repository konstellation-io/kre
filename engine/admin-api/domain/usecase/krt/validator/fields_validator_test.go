package validator_test

import (
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt/validator"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestYamlFieldsValidator_Run(t *testing.T) {
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
			name:        "fails if version name has an invalid length",
			krtYaml:     NewKrtBuilder().V1().WithVersion("this-version-name-length-is-higher-than-the-maximum").Build(),
			wantError:   true,
			errorString: "invalid length \"this-version-name-length-is-higher-than-the-maximum\" at \"Version\" must be lower than 20",
		},
		{
			name:        "fails if krt hasn't required field description",
			krtYaml:     NewKrtBuilder().V1().WithDescription("").Build(),
			wantError:   true,
			errorString: "the field \"Description\" is required",
		},
		{
			name:        "fails if proto doesn't end with .proto",
			krtYaml:     NewKrtBuilder().V1().WithEntrypointProto("invalid").Build(),
			wantError:   true,
			errorString: "invalid value \"invalid\" at \"Entrypoint.Proto\" must end with .proto",
		},
		{
			name:        "fails if required proto field is not defined",
			krtYaml:     NewKrtBuilder().V1().WithEntrypointProto("").Build(),
			wantError:   true,
			errorString: "the field \"Entrypoint.Proto\" is required",
		},
		{
			name:        "fails if required image field is not defined",
			krtYaml:     NewKrtBuilder().V1().WithEntrypointImage("").Build(),
			wantError:   true,
			errorString: "the field \"Entrypoint.Image\" is required",
		},
		{
			name:        "fails if and invalid env var is defined in config",
			krtYaml:     NewKrtBuilder().V1().WithConfigVars([]string{"invalid-var"}).Build(),
			wantError:   true,
			errorString: "invalid value \"invalid-var\" at env var \"Config.Variables[0]\" must contain only capital letters, numbers, and underscores",
		},
		{
			name:        "KRT YAML with invalid KRT Version",
			krtYaml:     NewKrtBuilder().WithKrtVersion("invalid-version").Build(),
			wantError:   true,
			errorString: "invalid value \"invalid-version\" at krtVersion",
		},
	}

	valuesValidator := validator.NewYamlFieldsValidator()

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			err := valuesValidator.Run(tc.krtYaml)
			if tc.wantError {
				assert.Error(t, err[0], tc.errorString)
				return
			}
			assert.Empty(t, err)
		})
	}
}
