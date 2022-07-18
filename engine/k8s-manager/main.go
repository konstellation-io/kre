package main

import (
	"log"
	"net"

	"github.com/konstellation-io/kre/libs/simplelogger"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"github.com/konstellation-io/kre/engine/k8s-manager/config"
	"github.com/konstellation-io/kre/engine/k8s-manager/kubernetes"
	"github.com/konstellation-io/kre/engine/k8s-manager/kubernetes/version"
	"github.com/konstellation-io/kre/engine/k8s-manager/nats"
	"github.com/konstellation-io/kre/engine/k8s-manager/proto/versionpb"
	"github.com/konstellation-io/kre/engine/k8s-manager/service"
)

func main() {
	cfg := config.NewConfig()
	port := cfg.Server.Port

	listener, err := net.Listen("tcp", "0.0.0.0:"+port)
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	logger := simplelogger.New(simplelogger.LevelDebug)
	s := grpc.NewServer()

	clientset := kubernetes.NewClientset(cfg)

	watcher := kubernetes.NewWatcher(cfg, logger, clientset)

	natsManager := nats.NewNatsManager(cfg, logger)

	versionManager := version.New(cfg, logger, clientset, natsManager)
	versionService := service.NewVersionService(cfg, logger, versionManager, watcher)

	versionpb.RegisterVersionServiceServer(s, versionService)
	reflection.Register(s)

	log.Printf("Server listenting: %v", port)

	if err := s.Serve(listener); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
