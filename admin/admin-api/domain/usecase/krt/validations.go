package krt

import (
	"fmt"
	"github.com/go-playground/validator/v10"
	"os"
	"path"
	"regexp"
)

var krtValidator *validator.Validate

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
