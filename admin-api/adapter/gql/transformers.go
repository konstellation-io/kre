package gql

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"time"
)

func toGQLRuntime(runtime *entity.Runtime, user *entity.User) (gqlRuntime *Runtime) {
	if runtime == nil {
		return
	}

	gqlRuntime = &Runtime{
		ID:           runtime.ID,
		Name:         runtime.Name,
		Status:       RuntimeStatus(runtime.Status),
		CreationDate: runtime.CreationDate.Format(time.RFC3339),
		Versions:     []*Version{},
	}

	if user != nil {
		gqlRuntime.CreationAuthor = &User{
			ID:    user.ID,
			Email: user.Email,
		}
	}

	return
}
