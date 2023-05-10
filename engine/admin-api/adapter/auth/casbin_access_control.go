package auth

import (
	"errors"
	"fmt"

	"github.com/casbin/casbin/v2"

	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/token"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

type CasbinAccessControl struct {
	logger   logging.Logger
	enforcer *casbin.Enforcer
}

func NewCasbinAccessControl(logger logging.Logger, modelPath, policyPath string) (*CasbinAccessControl, error) {
	enforcer, err := casbin.NewEnforcer(modelPath, policyPath)
	if err != nil {
		return nil, err
	}

	enforcer.AddFunction("isAdmin", isAdminFunc)
	enforcer.AddFunction("hasGrantForResource", hasGrantsForResourceFunc)

	return &CasbinAccessControl{
		logger,
		enforcer,
	}, nil
}

func (a *CasbinAccessControl) CheckPermission(
	user *token.UserRoles,
	resource string,
	action auth.AccessControlAction,
) error {
	if !action.IsValid() {
		return invalidAccessControlActionError
	}

	for _, realmRole := range user.RealmAccess.Roles {
		allowed, err := a.enforcer.Enforce(realmRole, user.ProductRoles, action.String())
		if err != nil {
			a.logger.Errorf("error checking permission: %s", err)
			return err
		}

		a.logger.Infof(
			"Checking permission userID[%s] realmRole[%s] action[%s] resource[%s] allowed[%t]",
			user.UserId, realmRole, action, resource, allowed,
		)

		if allowed {
			return nil
		}
	}

	//nolint:goerr113 // errors need to be wrapped
	return fmt.Errorf("you are not allowed to %s %s", action, resource)
}

func hasGrantsForResource(
	grants map[string][]string,
	resource,
	act string,
) bool {
	resGrants, ok := grants[resource]
	if !ok {
		return false
	}

	for _, grant := range resGrants {
		if grant == act {
			return true
		}
	}
	return false
}

func hasGrantsForResourceFunc(args ...interface{}) (interface{}, error) {
	grants := args[0].(map[string][]string)
	resource := args[1].(string)
	act := args[2].(string)

	return hasGrantsForResource(grants, resource, act), nil
}

func isAdmin(role string) bool {
	return role == "ADMIN"
}

func isAdminFunc(args ...interface{}) (interface{}, error) {
	role := args[0].(string)

	return isAdmin(role), nil
}
