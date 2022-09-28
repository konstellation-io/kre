package krt

import (
	"fmt"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

const (
	VersionV1 = "v1"
	VersionV2 = "v2"
)

type Validator interface {
	CheckSpec(krt *Krt) error
	CheckExecutables(krt *Krt) error
}

func NewValidator(logger logging.Logger, krtVersion string) Validator {
	if krtVersion == VersionV2 {
		return &ValidatorV2{
			logger: logger,
		}
	}
	return &ValidatorV1{
		logger: logger,
	}
}

type ValidatorV1 struct {
	logger logging.Logger
}

func (v *ValidatorV1) CheckSpec(krt *Krt) error {
	v.logger.Info("Validating KRT workflows")
	if err := v.validateWorkflows(krt); err != nil {
		return fmt.Errorf("error on KRT Workflow validation: %w", err)
	}
	return nil
}

func (v *ValidatorV1) CheckExecutables(krt *Krt) error {
	return nil
}

// validateWorkflows checks if the nodes from all workflows are definded and exist in krt spec
func (v *ValidatorV1) validateWorkflows(k *Krt) error {
	definedNodes := map[string]bool{}
	for _, node := range k.Nodes {
		definedNodes[node.Name] = true
	}

	for _, workflow := range k.Workflows {
		for _, nodeName := range workflow.Sequential {
			if !v.isNodeDefined(definedNodes, nodeName) {
				return fmt.Errorf("node in sequential not found: %s", nodeName)
			}
		}
	}

	return nil
}

func (v *ValidatorV1) isNodeDefined(definedNodes map[string]bool, nodeName string) bool {
	_, ok := definedNodes[nodeName]
	return ok
}

type ValidatorV2 struct {
	logger logging.Logger
}

func (v *ValidatorV2) CheckSpec(krt *Krt) error {
	return nil
}

func (v *ValidatorV2) CheckExecutables(krt *Krt) error {
	return nil
}
