package service

type ResourceManagerService interface {
	DeployVersion(name string) error
	ActivateVersion(name string) error
	CheckVersionIsCreated(name string) error
}
