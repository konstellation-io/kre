package main

import (
	"log"
	"net"

	"github.com/konstellation-io/kre/engine/nats-manager/config"
	"github.com/konstellation-io/kre/engine/nats-manager/manager"
	"github.com/konstellation-io/kre/engine/nats-manager/nats"
	"github.com/konstellation-io/kre/engine/nats-manager/proto/natspb"
	"github.com/konstellation-io/kre/engine/nats-manager/service"

	"github.com/konstellation-io/kre/libs/simplelogger"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
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

	grpcServer := grpc.NewServer()

	//natsConn, err := nats.Connect(cfg.NatsStreaming.URL)
	//if err != nil {
	//	log.Fatalf("Failed connecting to NATS: %v", err)
	//}
	//
	//js, err := natsConn.JetStream()
	//if err != nil {
	//	log.Fatalf("Failed connecting to NATS JetStream: %v", err)
	//}

	natsClient := nats.New(logger)
	err = natsClient.Connect(cfg.NatsStreaming.URL)
	if err != nil {
		log.Fatal(err)
	}

	natsManager := manager.NewNatsManager(logger, natsClient)
	natsService := service.NewNatsService(cfg, logger, natsManager)
	natspb.RegisterNatsManagerServiceServer(grpcServer, natsService)
	reflection.Register(grpcServer)

	logger.Infof("Server listening on port: %s", port)
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}
