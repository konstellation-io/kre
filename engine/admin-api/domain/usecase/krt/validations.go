package krt

import (
	"fmt"
	"os"
	"path"
	"regexp"

	"github.com/go-playground/validator/v10"
)

var krtValidator *validator.Validate
var validKrtVersions = map[string]bool{"v1": true, "v2": true}

func init() {
	krtValidator = validator.New()

	// register validator for resource names. Ex: name-valid123
	reResourceName := regexp.MustCompile("^[a-z0-9]([-a-z0-9]*[a-z0-9])?$")
	_ = krtValidator.RegisterValidation("resource-name", func(fl validator.FieldLevel) bool {
		return reResourceName.MatchString(fl.Field().String())
	})

	// register validator for env var names. Ex: NAME_VALID123
	reEnvVar := regexp.MustCompile("^[A-Z0-9]([_A-Z0-9]*[A-Z0-9])?$")
	_ = krtValidator.RegisterValidation("env", func(fl validator.FieldLevel) bool {
		return reEnvVar.MatchString(fl.Field().String())
	})

	_ = krtValidator.RegisterValidation("krt-version", func(fl validator.FieldLevel) bool {
		_, ok := validKrtVersions[fl.Field().String()]
		return ok
	})

	krtValidator.RegisterStructValidation(v1Validations, Krt{})
}

func v1Validations(sl validator.StructLevel) {
	krtYaml := sl.Current().Interface().(Krt)

	if krtYaml.KrtVersion == VersionV1 || krtYaml.KrtVersion == "" {
		for i, node := range krtYaml.Nodes {
			if node.Subscriptions != nil {
				fieldName := fmt.Sprintf("nodes[%d].subscriptions", i)
				sl.ReportError(krtYaml.Nodes[i].Subscriptions, fieldName, "Subscriptions", "v1-nodes", "")
			}
		}
		for i, workflow := range krtYaml.Workflows {
			if workflow.ExitPoint != "" {
				sl.ReportError(krtYaml.Workflows[i].Nodes, "nodes", "Nodes", "v1-workflows", "")
			}
			if workflow.Nodes != nil {
				sl.ReportError(krtYaml.Workflows[i].Nodes, "nodes", "Nodes", "v1-workflows", "")
			}

			if len(workflow.Sequential) < 1 {
				fieldName := fmt.Sprintf("workflows[%d].sequential", i)
				sl.ReportError(workflow.Sequential, fieldName, "Sequential", "v1-workflows", "")
			}
		}
	}

	if krtYaml.KrtVersion == VersionV2 {
		for i, workflow := range krtYaml.Workflows {
			if workflow.Sequential != nil {
				fieldName := fmt.Sprintf("workflows[%d].sequential", i)
				sl.ReportError(krtYaml.Workflows[i].Sequential, fieldName, "Sequential", "v2-workflows", "")
			}
			for j, node := range workflow.Nodes {
				if len(node.Subscriptions) < 1 {
					fieldName := fmt.Sprintf("workflows[%d].nodes[%d].subscriptions", i, j)
					sl.ReportError(krtYaml.Workflows[i].Nodes[j].Subscriptions, fieldName, "Subscriptions", "v2-workflows", "")
				}
			}
		}
	}

}

type ValuesValidator interface {
	Run(yaml interface{}) error
}

type YamlValuesValidator struct {
	validator *validator.Validate
}

func NewYamlValuesValidator() *YamlValuesValidator {
	return &YamlValuesValidator{
		validator: krtValidator,
	}
}

func (k *YamlValuesValidator) Run(yaml interface{}) error {
	return k.validator.Struct(yaml)
}

func ValidateYaml(krt *Krt) error {
	err := krtValidator.Struct(krt)
	if err != nil {
		return err
	}

	return nil
}

func validateSrcPaths(krt *Krt, dstDir string) []error {
	var errors []error = nil
	for _, node := range krt.Nodes {
		nodeFile := path.Join(dstDir, node.Src)
		if !fileExists(nodeFile) {
			errors = append(errors, fmt.Errorf("error src File %s for node %s not exists ", node.Src, node.Name))
		}
	}

	return errors
}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}

func validateWorkflows(k *Krt) error {
	nodeList := map[string]int{}
	for _, node := range k.Nodes {
		nodeList[node.Name] = 1
	}

	for _, workflow := range k.Workflows {
		for _, nodeName := range workflow.Sequential {
			if _, ok := nodeList[nodeName]; !ok {
				return fmt.Errorf("node in sequential not found: %s", nodeName)
			}
		}
	}

	return nil
}
