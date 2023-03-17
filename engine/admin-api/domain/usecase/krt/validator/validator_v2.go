package validator

import (
	"fmt"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type ValidatorV2 struct {
	logger          logging.Logger
	fieldsValidator FieldsValidator
}

func (v *ValidatorV2) Run(krtYaml *krt.Krt) error {
	v.logger.Info("Validating krt.yml")
	var errs []error
	fieldValidationErrors := v.fieldsValidator.Run(krtYaml)
	if fieldValidationErrors != nil {
		errs = append(errs, fieldValidationErrors...)
	}

	workflowValidationErrors := v.getWorkflowsValidationErrors(krtYaml.Workflows)
	if workflowValidationErrors != nil {
		errs = append(errs, workflowValidationErrors...)
	}

	if errs != nil {
		return NewValidationError(errs)
	}

	return nil
}

func (v *ValidatorV2) getWorkflowsValidationErrors(workflows []krt.Workflow) []error {
	var validationErrors []error
	for _, workflow := range workflows {
		existingNodes := make(map[string]bool, len(workflow.Nodes))
		for _, node := range workflow.Nodes {
			existingNodes[node.Name] = true
			if len(node.Subscriptions) < 1 {
				validationErrors = append(validationErrors, fmt.Errorf("node %q requires at least one subscription", node.Name))
			}
		}

		exitpointError := v.validateExitpoint(workflow, existingNodes)
		if exitpointError != nil {
			validationErrors = append(validationErrors, exitpointError)
		}
	}
	return validationErrors
}

func (v *ValidatorV2) CheckExecutables(krt *krt.Krt) error {
	return nil
}

func (v *ValidatorV2) validateExitpoint(workflow krt.Workflow, nodes map[string]bool) error {
	if workflow.Exitpoint == "" {
		return fmt.Errorf("missing exitpoint in workflow %q", workflow.Name)
	} else {
		if !isNodeDefined(nodes, workflow.Exitpoint) {
			return fmt.Errorf("exitpoint node %q not found in workflow %q nodes", workflow.Exitpoint, workflow.Name)
		}
	}
	return nil
}
