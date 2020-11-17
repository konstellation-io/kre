package main

import (
	"fmt"
	"github.com/golang/protobuf/proto"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/any"

	"github.com/konstellation-io/kre-runners/kre-go"
)

func handlerInit(ctx *kre.HandlerContext) {
	ctx.Logger.Info("[worker init]")
	ctx.Set("greeting", "Hello")
}

func handler(ctx *kre.HandlerContext, data *any.Any) (proto.Message, error) {
	ctx.Logger.Info("[worker handler]")

	req := &Request{}
	res := &Response{}

	err := ptypes.UnmarshalAny(data, req)
	if err != nil {
		return res, fmt.Errorf("invalid request: %s", err)
	}

	greetingText := fmt.Sprintf("%s %s!", ctx.Get("greeting"), req.Name)
	ctx.Logger.Info(greetingText)
	res.Greeting = greetingText

	// Saving salutation into DB for later analysis or use
	err = ctx.DB.Save("go-greeter", res)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func main() {
	kre.Start(handlerInit, handler)
}
