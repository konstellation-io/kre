package main

import (
	"log"
	"net"

	"github.com/konstellation-io/kre/libs/simplelogger"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"github.com/konstellation-io/kre/engine/nats-manager/internal/config"
	"github.com/konstellation-io/kre/engine/nats-manager/internal/manager"
	"github.com/konstellation-io/kre/engine/nats-manager/internal/service"
	"github.com/konstellation-io/kre/engine/nats-manager/nats"
	"github.com/konstellation-io/kre/engine/nats-manager/proto/natspb"
)

func main() {
	logger := simplelogger.New(simplelogger.LevelDebug)
	logger.Info("Starting NATS manager")

	cfg := config.NewConfig()
	port := cfg.Server.Port

	listener, err := net.Listen("tcp", "0.0.0.0:"+port)
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	logger.Info("Connecting to NATS...")
	js, err := nats.InitJetStreamConnection(cfg.NatsStreaming.URL)
	if err != nil {
		log.Fatal(err)
	}

	natsClient := nats.New(logger, js)

	grpcServer := grpc.NewServer()

	natsManager := manager.NewNatsManager(logger, natsClient)
	natsService := service.NewNatsService(cfg, logger, natsManager)
	natspb.RegisterNatsManagerServiceServer(grpcServer, natsService)
	reflection.Register(grpcServer)

	logger.Infof("Server listening on port: %s", port)
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
