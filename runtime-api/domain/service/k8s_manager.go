package service

type ResourceManagerService interface {
	CreateRuntimeVersion(name string) error
	CheckRuntimeVersionIsCreated(name string) error
}
