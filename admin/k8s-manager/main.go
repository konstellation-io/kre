package main

import (
	"log"
	"net"

	"github.com/konstellation-io/kre/libs/simplelogger"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"github.com/konstellation-io/kre/admin/k8s-manager/config"
	"github.com/konstellation-io/kre/admin/k8s-manager/kubernetes"
	"github.com/konstellation-io/kre/admin/k8s-manager/kubernetes/runtime"
	"github.com/konstellation-io/kre/admin/k8s-manager/kubernetes/version"
	"github.com/konstellation-io/kre/admin/k8s-manager/prometheus/resourcemetrics"
	"github.com/konstellation-io/kre/admin/k8s-manager/proto/resourcemetricspb"
	"github.com/konstellation-io/kre/admin/k8s-manager/proto/runtimepb"
	"github.com/konstellation-io/kre/admin/k8s-manager/proto/versionpb"
	"github.com/konstellation-io/kre/admin/k8s-manager/service"
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
	dynClient := kubernetes.NewDynamicClient(cfg)

	watcher := kubernetes.NewWatcher(clientset)

	runtimeManager := runtime.New(cfg, logger, clientset, dynClient)
	runtimeService := service.NewRuntimeService(cfg, logger, runtimeManager, watcher)

	versionManager := version.New(cfg, logger, clientset)
	versionService := service.NewVersionService(cfg, logger, versionManager)

	resourceMetricsManager, err := resourcemetrics.New(cfg, logger)
	if err != nil {
		log.Fatalf("error creating metricsmanager: %v", err)
	}

	resourceMetricsService := service.NewResourceMetricsService(logger, resourceMetricsManager)

	runtimepb.RegisterRuntimeServiceServer(s, runtimeService)
	versionpb.RegisterVersionServiceServer(s, versionService)
	resourcemetricspb.RegisterResourceMetricsServiceServer(s, resourceMetricsService)
	reflection.Register(s)

	log.Printf("Server listenting: %v", port)

	if err := s.Serve(listener); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
