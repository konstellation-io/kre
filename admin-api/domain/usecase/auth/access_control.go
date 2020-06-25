package auth

type AccessControl interface {
	CheckPermission(userID, resource, action string) bool
	ReloadUserRoles() error
}
