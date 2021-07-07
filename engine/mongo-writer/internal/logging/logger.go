package logging

import (
	"strings"

	"github.com/konstellation-io/kre/libs/simplelogger"
)

func NewLogger(logLevel string) Logger {
	var level simplelogger.LogLevel

	switch strings.ToLower(logLevel) {
	case "debug":
		level = simplelogger.LevelDebug
	case "info":
		level = simplelogger.LevelInfo
	case "warn":
		level = simplelogger.LevelWarn
	case "error":
		level = simplelogger.LevelError
	}

	return simplelogger.New(level)
}
