package main

import (
	"log"
	"net"

	"google.golang.org/grpc"

	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/config"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/kubernetes"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/kubernetes/runtime"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/kubernetes/version"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/proto/runtimepb"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/proto/versionpb"
	"gitlab.com/konstellation/konstellation-ce/kre/k8s-manager/service"
)

func main() {
	cfg := config.NewConfig()
	port := cfg.Server.Port
	listener, err := net.Listen("tcp", "0.0.0.0:"+port)
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	logger := logging.NewLogger()
	s := grpc.NewServer()

	clientset := kubernetes.NewClientset(cfg)
	dynClient := kubernetes.NewDynamicClient(cfg)

	watcher := kubernetes.NewWatcher(clientset)

	runtimeManager := runtime.New(cfg, logger, clientset, dynClient)
	runtimeService := service.NewRuntimeService(cfg, logger, runtimeManager, watcher)

	versionManager := version.New(cfg, logger, clientset)
	versionService := service.NewVersionService(cfg, logger, versionManager)

	runtimepb.RegisterRuntimeServiceServer(s, runtimeService)
	versionpb.RegisterVersionServiceServer(s, versionService)

	log.Printf("Server listenting: %v", port)
	if err := s.Serve(listener); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
