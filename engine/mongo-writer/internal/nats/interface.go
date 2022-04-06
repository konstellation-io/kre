package nats

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

import (
	nc "github.com/nats-io/nats.go"
)

type Manager interface {
	Connect() error
	Disconnect()
	SubscribeToChannel(channel string) chan *nc.Msg
	IncreaseTotalMsgs(amount int64)
	TotalMsgs() int64
}
