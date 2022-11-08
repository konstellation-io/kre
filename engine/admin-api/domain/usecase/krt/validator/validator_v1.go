package validator

import (
	"errors"
	"fmt"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type ValidatorV1 struct {
	logger          logging.Logger
	fieldsValidator FieldsValidator
}

func (v *ValidatorV1) Run(krtYaml *krt.Krt) error {
	v.logger.Info("Validating krt.yml")
	var errs []error
	fieldsValidatorErrors := v.fieldsValidator.Run(krtYaml)
	if fieldsValidatorErrors != nil {
		errs = append(errs, fieldsValidatorErrors...)
	}

	nodesValidationErrors := v.getNodesValidationErrors(krtYaml.Nodes)
	if nodesValidationErrors != nil {
		errs = append(errs, nodesValidationErrors...)
	}

	workflowsValidationErrors := v.getWorkflowsValidationErrors(krtYaml.Workflows, krtYaml.Nodes)
	if workflowsValidationErrors != nil {
		errs = append(errs, workflowsValidationErrors...)
	}

	if errs != nil {
		return NewValidationError(errs)
	}

	return nil
}

func (v *ValidatorV1) CheckExecutables(krtYaml *krt.Krt) error {
	return nil
}

func (v *ValidatorV1) validateNodes(nodes []krt.Node) []string {
	for _, node := range nodes {
		if node.Subscriptions != nil {
			return []string{fmt.Sprintf("The field \"node.subscriptions\" is incompatible with version v1")}
		}
	}
	return nil
}

func (v *ValidatorV1) getWorkflowsValidationErrors(workflows []krt.Workflow, nodes []krt.Node) []error {
	var validationErrors []error
	definedNodes := v.getDefinedNodes(nodes)
	for _, workflow := range workflows {
		if workflow.Exitpoint != "" {
			validationErrors = append(validationErrors, errors.New("the field \"workflow.exitpoint\" is incompatible with version v1"))
		}
		if workflow.Nodes != nil {
			validationErrors = append(validationErrors, errors.New("the field \"workflow.nodes\" is incompatible with version v1"))
		}

		if len(workflow.Sequential) < 1 {
			validationErrors = append(validationErrors, errors.New("the field \"workflow.sequential\" hasn't nodes defined"))
		}

		err := v.checkIfWorkflowNodesExists(workflow, definedNodes)
		if err != nil {
			validationErrors = append(validationErrors, err)
		}
	}
	return validationErrors
}

func (v *ValidatorV1) getDefinedNodes(nodes []krt.Node) map[string]bool {
	definedNodes := make(map[string]bool, len(nodes))
	for _, node := range nodes {
		definedNodes[node.Name] = true
	}
	return definedNodes
}

func (v *ValidatorV1) checkIfWorkflowNodesExists(workflow krt.Workflow, definedNodes map[string]bool) error {
	for _, nodeName := range workflow.Sequential {
		if !isNodeDefined(definedNodes, nodeName) {
			return fmt.Errorf("node \"%s\" in workflow \"%s\" not defined in nodes list", nodeName, workflow.Name)
		}
	}
	return nil
}

func (v *ValidatorV1) getNodesValidationErrors(nodes []krt.Node) []error {
	var errs []error
	for _, node := range nodes {
		if node.Subscriptions != nil {
			errs = append(errs, fmt.Errorf("field Subscriptions in node \"%s\" is incompatible with version %s", node.Name, entity.KRTVersionV1))
		}
	}
	return errs
}
