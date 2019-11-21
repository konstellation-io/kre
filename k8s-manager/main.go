package main

import (
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/kubernetes"

	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/config"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/runtimepb"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/server"

	"log"
	"net"

	"google.golang.org/grpc"
)

func main() {
	cfg := config.NewConfig()
	serverAddress := "0.0.0.0:" + cfg.Server.Port
	listener, err := net.Listen("tcp", serverAddress)
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	s := grpc.NewServer()

	resManager := kubernetes.NewKubernetesResourceManager(cfg)
	runtimeService := server.NewGrpcServer(cfg, resManager)
	runtimepb.RegisterRuntimeServiceServer(s, runtimeService)

	log.Printf("Server listenting: %v", cfg.Server.Port)
	if err := s.Serve(listener); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}

}
