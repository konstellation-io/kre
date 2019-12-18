package gql

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"time"
)

func toGQLUser(user *entity.User) (gqlUser *User) {
	if user == nil {
		return
	}

	return &User{
		ID:    user.ID,
		Email: user.Email,
	}
}

func toGQLRuntime(runtime *entity.Runtime, user *entity.User) (gqlRuntime *Runtime) {
	if runtime == nil {
		return
	}

	gqlRuntime = &Runtime{
		ID:             runtime.ID,
		Name:           runtime.Name,
		Status:         RuntimeStatus(runtime.Status),
		CreationDate:   runtime.CreationDate.Format(time.RFC3339),
		Versions:       []*Version{},
		CreationAuthor: toGQLUser(user),
	}

	return
}

func toGQLVersion(version *entity.Version, creationUser *entity.User) (gqlVersion *Version) {
	if version == nil {
		return
	}

	gqlVersion = &Version{
		ID:             version.ID,
		Name:           version.Name,
		Description:    "",
		Status:         VersionStatus(version.Status),
		CreationDate:   version.CreationDate.Format(time.RFC3339),
		CreationAuthor: toGQLUser(creationUser),
		// TODO add activation fields, or not
	}

	return
}
