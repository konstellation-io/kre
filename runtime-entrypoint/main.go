package main

import (
	"context"
	entrypoint "gitlab.com/konstellation/konstellation-ce/kre/runtime-entrypoint/proto"
	"google.golang.org/grpc/reflection"
	"net"

	"github.com/prometheus/common/log"
	"google.golang.org/grpc"

	nats "github.com/nats-io/nats.go"
)

type GRPCServerWrapper struct {
	*grpc.Server
	*nc.
}

func (G GRPCServerWrapper) Ping(context.Context, *entrypoint.PingRequest) (*entrypoint.PingResponse, error) {
	log.Info("Ping success")
	nc.Publish("foo", []byte("Hello World"))
	return &entrypoint.PingResponse{
		Success: true,
	}, nil
}

func (G GRPCServerWrapper) initNats (){
	nc, _ := nats.Connect("localhost:4223")
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
	grpcServerWrapper := &GRPCServerWrapper{grpcServer}
	entrypoint.RegisterEchoServiceServer(grpcServer, grpcServerWrapper)
	log.Infof("Grpc server listen in %s ", urlConnection)

	err = grpcServer.Serve(lis)
	if err != nil {
		log.Fatal("Grpc server listen error in port: %d")
	}

	log.Info("Grpc server init successfully")

}
