package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/casbin/casbin/v2"

	"github.com/konstellation-io/kre/engine/admin-api/domain/repository"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type CasbinAccessControl struct {
	logger   logging.Logger
	enforcer *casbin.Enforcer
	userRepo repository.UserRepo
}

func NewCasbinAccessControl(logger logging.Logger, userRepo repository.UserRepo, modelPath, policyPath string) (*CasbinAccessControl, error) {
	e, err := casbin.NewEnforcer(modelPath, policyPath)
	if err != nil {
		return nil, err
	}

	accessControl := &CasbinAccessControl{
		logger,
		e,
		userRepo,
	}

	err = accessControl.ReloadUserRoles()
	if err != nil {
		return nil, err
	}

	return accessControl, nil
}

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

func (a *CasbinAccessControl) ReloadUserRoles() error {
	a.logger.Infof("[RBAC] Reloading user roles")
	users, err := a.userRepo.GetAll(context.Background(), false)
	if err != nil {
		return err
	}

	for _, u := range users {
		a.logger.Infof("[RBAC] Removing roles for user %s (%s)", u.ID, u.Email)
		_, err := a.enforcer.DeleteRolesForUser(u.ID)
		if err != nil {
			return err
		}

		a.logger.Infof("[RBAC] Adding role %s to user %s (%s)", u.AccessLevel.String(), u.ID, u.Email)
		_, err = a.enforcer.AddRoleForUser(u.ID, u.AccessLevel.String())
		if err != nil {
			return err
		}
	}

	return nil
}
