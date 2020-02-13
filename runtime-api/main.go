package main

import (
	"log"
	"net"

	"google.golang.org/grpc"

	"gitlab.com/konstellation/kre/runtime-api/config"
	"gitlab.com/konstellation/kre/runtime-api/kubernetes"
	"gitlab.com/konstellation/kre/runtime-api/logging"
	"gitlab.com/konstellation/kre/runtime-api/mongo"
	"gitlab.com/konstellation/kre/runtime-api/proto/monitoringpb"
	"gitlab.com/konstellation/kre/runtime-api/service"
)

func main() {
	cfg := config.NewConfig()
	logger := logging.NewLogger()

	port := cfg.Server.Port
	listener, err := net.Listen("tcp", "0.0.0.0:"+port)
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	s := grpc.NewServer()

	clientset := kubernetes.NewClientset(cfg)

	status := kubernetes.NewWatcher(cfg, logger, clientset)
	logs := mongo.NewWatcher(cfg, logger)

	srv := service.NewMonitoringService(cfg, logger, status, logs)

	monitoringpb.RegisterMonitoringServiceServer(s, srv)

	log.Printf("Server listenting: %v", port)
	if err := s.Serve(listener); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
