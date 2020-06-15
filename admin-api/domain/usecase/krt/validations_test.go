package krt_test

import (
	"strings"
	"testing"

	"github.com/konstellation-io/kre/admin-api/domain/usecase/krt"
)

func TestValidateYaml_InvalidVersionName(t *testing.T) {
	krtYml := &krt.Krt{
		Version: "INVALIDname",
	}
	err := krt.ValidateYaml(krtYml)

	expectedErr := "Key: 'Krt.Version' Error:Field validation for 'Version' failed on the 'resource-name' tag"

	if !strings.Contains(err.Error(), expectedErr) {
		t.Fatalf("The version name '%s' cannot contain uppercase chars", krtYml.Version)
	}
}

func TestValidateYaml_InvalidNodeName(t *testing.T) {
	krtYml := &krt.Krt{
		Nodes: []krt.Node{
			{
				Name:  "INVALIDname",
				Image: "",
				Src:   "",
			},
		},
	}
	err := krt.ValidateYaml(krtYml)

	expectedErr := "'Krt.Nodes[0].Name' Error:Field validation for 'Name' failed on the 'resource-name' tag"

	if !strings.Contains(err.Error(), expectedErr) {
		t.Fatalf("The version name '%s' cannot contain uppercase chars", krtYml.Nodes[0].Name)
	}
}
