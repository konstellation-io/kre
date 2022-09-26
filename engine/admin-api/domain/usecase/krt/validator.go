package krt

import (
	"fmt"
	"strings"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

const (
	VersionV1 = "v1"
	VersionV2 = "v2"
)

type Validator interface {
	Run(krt *Krt) error
	CheckExecutables(krt *Krt) error
}

func NewValidator(logger logging.Logger, krtVersion string, fieldsValidator ValuesValidator) Validator {
	if krtVersion == VersionV2 {
		return &ValidatorV2{
			logger:          logger,
			fieldsValidator: fieldsValidator,
		}
	}
	return &ValidatorV1{
		logger:          logger,
		fieldsValidator: fieldsValidator,
	}
}

type ValidatorV1 struct {
	logger          logging.Logger
	fieldsValidator ValuesValidator
}

func (v *ValidatorV1) Run(krt *Krt) error {
	v.logger.Info("Validating KRT workflows")
	err := v.fieldsValidator.Run(krt)
	if err != nil {
		return err
	}
	err = v.validateSchema(krt)
	if err != nil {
		return err
	}
	if err := v.validateWorkflows(krt); err != nil {
		return fmt.Errorf("error on KRT Workflow validation: %w", err)
	}
	return nil
}

func (v *ValidatorV1) CheckExecutables(krt *Krt) error {
	return nil
}

func (v *ValidatorV1) validateSchema(krtYaml *Krt) error {
	v.logger.Infof("Validating krt.yml schema")
	var errorMessages []string
	for _, node := range krtYaml.Nodes {
		if node.Subscriptions != nil {
			errorMessages = append(errorMessages, fmt.Sprintf("- The field \"node.subscriptions\" is incompatible with version v1"))
		}
	}
	for _, workflow := range krtYaml.Workflows {
		if workflow.Exitpoint != "" {
			errorMessages = append(errorMessages, fmt.Sprintf("- The field \"workflow.exitpoint\" is incompatible with version v1"))

		}
		if workflow.Nodes != nil {
			errorMessages = append(errorMessages, fmt.Sprintf("- The field \"workflow.nodes\" is incompatible with version v1"))
		}

		if len(workflow.Sequential) < 1 {
			errorMessages = append(errorMessages, fmt.Sprintf("- Workflows require at least one node"))
		}
	}
	if len(errorMessages) > 0 {
		return fmt.Errorf(strings.Join(errorMessages, "\n"))
	}
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
	logger          logging.Logger
	fieldsValidator ValuesValidator
}

func (v *ValidatorV2) Run(krtYaml *Krt) error {
	var errorMessages []string
	for _, workflow := range krtYaml.Workflows {
		if workflow.Sequential != nil {
			errorMessages = append(errorMessages, fmt.Sprintf("- Field \"sequential\" is incompatible with krt version v2"))
		}
		for _, node := range workflow.Nodes {
			if len(node.Subscriptions) < 1 {
				errorMessages = append(errorMessages, fmt.Sprintf("- Node %s require at least one subscription", node.Name))
			}
		}
		if len(errorMessages) > 0 {
			return fmt.Errorf(strings.Join(errorMessages, "\n"))
		}
	}
	return nil
}

func (v *ValidatorV2) CheckExecutables(krt *Krt) error {
	return nil
}
