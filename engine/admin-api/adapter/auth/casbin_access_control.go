package auth

import (
	"errors"
	"fmt"

	"github.com/casbin/casbin/v2"

	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type CasbinAccessControl struct {
	logger   logging.Logger
	enforcer *casbin.Enforcer
}

func NewCasbinAccessControl(logger logging.Logger, modelPath, policyPath string) (*CasbinAccessControl, error) {
	e, err := casbin.NewEnforcer(modelPath, policyPath)
	if err != nil {
		return nil, err
	}

	accessControl := &CasbinAccessControl{
		logger,
		e,
	}

	return accessControl, nil
}

// change input params to ones obtained from jwt token
func (a *CasbinAccessControl) CheckPermission(userID string, resource auth.AccessControlResource, action auth.AccessControlAction) error {
	if !resource.IsValid() {
		return errors.New("invalid AccessControlResource")
	}

	if !action.IsValid() {
		return errors.New("invalid AccessControlAction")
	}

	allowed, err := a.enforcer.Enforce(userID, resource.String(), action.String())
	if err != nil {
		a.logger.Errorf("error checking permission: %s", err)
		return err
	}

	a.logger.Infof("Checking permission userID[%s] resource[%s] action[%s] allowed[%t]", userID, resource, action, allowed)
	if !allowed {
		return fmt.Errorf("you are not allowed to %s %s", action, resource)
	}

	return nil
}
