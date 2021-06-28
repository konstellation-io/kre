package parser

//go:generate mockgen -source=${GOFILE} -destination=mocks_${GOFILE} -package=${GOPACKAGE}

type FluentbitMsgParser interface {
	Parse(data []byte) ([]LogMsg, error)
}
