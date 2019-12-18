package grpc

import (
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/delivery/grpc/service"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/domain/usecase/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/runtime-api/runtimepb"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"net"
)

// App is the top-level struct.
type App struct {
	server *grpc.Server
	cfg    *config.Config
	logger logging.Logger
}

// NewApp factory function.
func NewApp(
	cfg *config.Config,
	logger logging.Logger,
	versionInteractor *usecase.VersionInteractor,
) *App {

	server := grpc.NewServer()
	reflection.Register(server)
	runtimeService := service.NewRuntimeService(cfg, logger, versionInteractor)

	runtimepb.RegisterRuntimeServiceServer(server, runtimeService)

	return &App{
		server: server,
		logger: logger,
		cfg:    cfg,
	}
}

// Start starts a GRPC server.
func (a *App) Start() {

	a.logger.Info("Starting server...")

	lis, err := net.Listen("tcp", "0.0.0.0:"+a.cfg.Server.Port)
	if err != nil {
		panic(fmt.Errorf("failed to listen: %v", err))
	}

	a.logger.Info("Starting listening on " + a.cfg.Server.Port)

	if err := a.server.Serve(lis); err != nil {
		panic(fmt.Errorf("failed to serve: %v", err))
	}

}
