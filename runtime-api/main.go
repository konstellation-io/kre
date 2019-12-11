package main

import (
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/adapter/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/adapter/service/k8s"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/delivery/grpc"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase"
)

func main() {
	cfg := config.NewConfig()
	logger := logging.NewLogger()

	resourceManager := k8s.NewResourceManagerService(cfg, logger)

	runtimeVersionInteractor := usecase.NewRuntimeVersionInteractor(logger, resourceManager)

	app := grpc.NewApp(
		cfg,
		logger,
		runtimeVersionInteractor,
	)
	app.Start()
}
