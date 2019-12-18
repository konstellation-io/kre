package main

import (
	"context"
	"fmt"
	entrypoint "gitlab.com/konstellation/konstellation-ce/kre/runtime-entrypoint/proto"
	"google.golang.org/grpc/reflection"
	"net"
	"os"
	"time"

	"github.com/prometheus/common/log"
	"google.golang.org/grpc"

	"github.com/nats-io/nats.go"
)

type GRPCServerWrapper struct {
	*grpc.Server
	*NatsInfo
}

type NatsInfo struct {
	ConnUrl string
	Channel string
	nc      *nats.Conn
}

func (g GRPCServerWrapper) Ping(ctx context.Context, request *entrypoint.PingRequest) (*entrypoint.PingResponse, error) {
	log.Info("Ping success")

	err := g.nc.Publish(g.Channel, []byte(fmt.Sprintf("Ping Received %s", time.Now())))
	if err != nil {
		return nil, err
	}

	return &entrypoint.PingResponse{
		Success: true,
	}, nil
}

func initNats() *NatsInfo {
	connUrl, channel := os.Getenv("NATS_URL"), os.Getenv("NATS_CHANNEL")
	if connUrl == "" {
		connUrl = "kre-nats:4222"
	}

	if channel == "" {
		channel = "entrypoint"
	}

	nc, err := nats.Connect(connUrl)

	if err != nil {
		panic("Error initializing NATS connection")
	}

	return &NatsInfo{
		connUrl,
		channel,
		nc,
	}
}

func main() {
	log.Info("Initializing")
	urlConnection := "0.0.0.0:9000"
	lis, err := net.Listen("tcp", urlConnection)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	var opts []grpc.ServerOption
	grpcServer := grpc.NewServer(opts...)
	reflection.Register(grpcServer)
	grpcServerWrapper := &GRPCServerWrapper{grpcServer, initNats()}
	entrypoint.RegisterEchoServiceServer(grpcServer, grpcServerWrapper)
	log.Infof("Grpc server listen in %s ", urlConnection)

	err = grpcServer.Serve(lis)
	if err != nil {
		log.Fatal("Grpc server listen error in port: %d")
	}

	log.Info("Grpc server init successfully")

}
