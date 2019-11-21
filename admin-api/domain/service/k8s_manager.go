package service

type K8sManagerService interface {
	CreateRuntime(name string) (string, error)
}
