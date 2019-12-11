package service

type ResourceManagerService interface {
	CreateRuntimeVersion(name string) (string, error)
}
