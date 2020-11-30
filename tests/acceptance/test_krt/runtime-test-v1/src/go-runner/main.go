package main

import (
	"fmt"
	"github.com/golang/protobuf/proto"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"
	"go-runner/pb"

	"github.com/konstellation-io/kre-runners/kre-go"
)

func handlerInit(ctx *kre.HandlerContext) {
	ctx.Logger.Info("[go-runner] init")
}

func handler(ctx *kre.HandlerContext, data *any.Any) (proto.Message, error) {
	ctx.Logger.Info("[go-runner] handler")

	msg := &pb.Message{}

	err := ptypes.UnmarshalAny(data, msg)
	if err != nil {
		return msg, fmt.Errorf("invalid msg: %w", err)
	}

	msg.GoRunnerSuccess = true

	return msg, nil
}

func main() {
	kre.Start(handlerInit, handler)
}
