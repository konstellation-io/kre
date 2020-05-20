package main

import (
	"encoding/json"
	"fmt"
	"log"

	"gitlab.com/konstellation/kre/runtime-runners/kre-go"
)

type Input struct {
	Name string `json:"name"`
}

type Output struct {
	Greeting string `json:"greeting"`
}

func handlerInit(ctx *kre.HandlerContext) {
	log.Println("[worker init]")
	ctx.SetValue("greeting", "Hello")
}

func handler(ctx *kre.HandlerContext, data []byte) (interface{}, error) {
	log.Println("[worker handler]")

	input := Input{}
	err := json.Unmarshal(data, &input)
	if err != nil {
		return nil, err
	}

	greetingText := fmt.Sprintf("%s %s!", ctx.GetValue("greeting"), input.Name)
	log.Println(greetingText)

	out := Output{}
	out.Greeting = greetingText
	return out, nil // Must be a serializable JSON
}

func main() {
	kre.Start(handlerInit, handler)
}
