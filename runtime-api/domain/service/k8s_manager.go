package service

type ResourceManagerService interface {
	CreateRuntimeVersion(id, name string) error
	CheckRuntimeVersionIsCreated(id, name string) error
}
