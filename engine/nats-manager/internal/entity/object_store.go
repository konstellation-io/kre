package entity

import (
	"regexp"

	"github.com/konstellation-io/kre/engine/nats-manager/internal/errors"
)

type ObjectStoreScope int

const (
	ScopeWorkflow = iota
	ScopeProject
)

type ObjectStore struct {
	Name  string
	Scope ObjectStoreScope
}

func (o *ObjectStore) Validate() error {
	isValidName, _ := regexp.MatchString("^[a-z0-9]([-a-z0-9]*[a-z0-9])?$", o.Name)

	if !isValidName {
		return errors.ErrInvalidObjectStoreName
	}

	switch o.Scope {
	case ScopeProject, ScopeWorkflow:
		return nil
	default:
		return errors.ErrInvalidObjectStoreScope
	}
}
