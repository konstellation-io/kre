module greeter

go 1.14

require (
	github.com/konstellation-io/kre/libs/simplelogger v0.0.0-20200612125025-86990df312ef // indirect
	github.com/konstellation-io/kre/runtime-runners/kre-go v0.0.0-20200520085043-c6c388dc28d4
)

replace github.com/konstellation-io/kre/runtime-runners/kre-go => ../../../../runtime-runners/kre-go
