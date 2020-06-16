package main

import (
	"net"
	"os"

	"github.com/konstellation-io/kre/libs/simplelogger"
	"google.golang.org/grpc"

	"github.com/konstellation-io/kre/runtime-api/config"
	"github.com/konstellation-io/kre/runtime-api/kubernetes"
	"github.com/konstellation-io/kre/runtime-api/mongo"
	"github.com/konstellation-io/kre/runtime-api/proto/monitoringpb"
	"github.com/konstellation-io/kre/runtime-api/service"
)

func main() {
	cfg := config.NewConfig()
	logger := simplelogger.New(simplelogger.LevelDebug)

	db := mongo.NewDB(cfg, logger)
	defer db.Disconnect()
	mongoClient := db.NewClient()

	port := cfg.Server.Port
	listener, err := net.Listen("tcp", "0.0.0.0:"+port)
	if err != nil {
		logger.Errorf("Failed to listen: %v", err)
		os.Exit(1)
	}

	s := grpc.NewServer()

	k8sManager := kubernetes.NewK8sManager(cfg, logger)
	clientset := k8sManager.NewClientset()

	status := kubernetes.NewWatcher(cfg, logger, clientset)

	logs := mongo.NewLogRepo(cfg, logger, mongoClient)
	metrics := mongo.NewMetricsRepo(cfg, logger, mongoClient)

	srv := service.NewMonitoringService(cfg, logger, status, logs, metrics)

	monitoringpb.RegisterMonitoringServiceServer(s, srv)

	logger.Infof("Server listening at port %s", port)
	if err := s.Serve(listener); err != nil {
		logger.Errorf("Failed to serve: %v", err)
		os.Exit(1)
	}
}
