package main

import (
	"gitlab.com/konstellation/kre/libs/simplelogger"
	"gitlab.com/konstellation/kre/runtime-api/config"
	"gitlab.com/konstellation/kre/runtime-api/kubernetes"
	"gitlab.com/konstellation/kre/runtime-api/mongo"
	"gitlab.com/konstellation/kre/runtime-api/proto/monitoringpb"
	"gitlab.com/konstellation/kre/runtime-api/service"
	"google.golang.org/grpc"
	"net"
	"os"
)

func main() {
	cfg := config.NewConfig()
	logger := simplelogger.New(simplelogger.LevelDebug)

	port := cfg.Server.Port
	listener, err := net.Listen("tcp", "0.0.0.0:"+port)
	if err != nil {
		logger.Errorf("Failed to listen: %v", err)
		os.Exit(1)
	}

	s := grpc.NewServer()

	clientset := kubernetes.NewClientset(cfg)

	status := kubernetes.NewWatcher(cfg, logger, clientset)
	logs := mongo.NewWatcher(cfg, logger)

	srv := service.NewMonitoringService(cfg, logger, status, logs)

	monitoringpb.RegisterMonitoringServiceServer(s, srv)

	logger.Infof("Server listenting: %v", port)
	if err := s.Serve(listener); err != nil {
		logger.Errorf("Failed to serve: %v", err)
		os.Exit(1)
	}
}
