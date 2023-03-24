package validator

import (
	"fmt"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

//go:generate mockgen -source=${GOFILE} -destination=../../../../mocks/validator_${GOFILE} -package=mocks

type Validator interface {
	Run(krt *krt.Krt) error
}

type KrtValidator struct {
	logger          logging.Logger
	fieldsValidator FieldsValidator
}

func NewKrtValidator(logger logging.Logger, fieldsValidator FieldsValidator) Validator {
	return &KrtValidator{
		logger:          logger,
		fieldsValidator: fieldsValidator,
	}
}

func (v *KrtValidator) Run(krtYaml *krt.Krt) error {
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

func (v *KrtValidator) getWorkflowsValidationErrors(workflows []krt.Workflow) []error {
	var validationErrors []error
	for _, workflow := range workflows {
		existingNodes := make(map[string]bool, len(workflow.Nodes))
		for _, node := range workflow.Nodes {

			nodeNameAlreadyInUse := existingNodes[node.Name]

			if nodeNameAlreadyInUse {
				validationErrors = append(validationErrors, ErrRepeatedNodeName)
			}

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

func (v *KrtValidator) validateExitpoint(workflow krt.Workflow, nodes map[string]bool) error {
	if workflow.Exitpoint == "" {
		return fmt.Errorf("missing exitpoint in workflow \"%s\"", workflow.Name)
	} else {
		if !isNodeDefined(nodes, workflow.Exitpoint) {
			return fmt.Errorf("exitpoint node %q not found in workflow %q nodes", workflow.Exitpoint, workflow.Name)
		}
	}
	return nil
}

func isNodeDefined(nodes map[string]bool, nodeName string) bool {
	_, ok := nodes[nodeName]
	return ok
}
