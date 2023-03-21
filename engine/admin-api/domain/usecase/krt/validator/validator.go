package validator

import (
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/krt"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

//go:generate mockgen -source=${GOFILE} -destination=../../../../mocks/validator_${GOFILE} -package=mocks

type Validator interface {
	Run(krt *krt.Krt) error
	CheckExecutables(krt *krt.Krt) error
}

func NewValidator(logger logging.Logger, fieldsValidator FieldsValidator) Validator {
	return &ValidatorV2{
		logger:          logger,
		fieldsValidator: fieldsValidator,
	}
}

func isNodeDefined(nodes map[string]bool, nodeName string) bool {
	_, ok := nodes[nodeName]
	return ok
}
