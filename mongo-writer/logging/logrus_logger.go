package logging

import (
	"os"

	"gitlab.com/konstellation/konstellation-ce/kre/mongo-writer/config"

	log "github.com/sirupsen/logrus"
)

type Logger struct {
	logger *log.Entry
}

// NewLogger creates a new logrus logger instance.
func NewLogger(cfg *config.Config) *Logger {
	// Log as JSON instead of the default ASCII formatter.
	log.SetFormatter(&log.JSONFormatter{})

	// Output to stdout instead of the default stderr
	// Can be any io.Writer, see below for File example
	log.SetOutput(os.Stdout)

	// Only log the warning severity or above.
	log.SetLevel(log.InfoLevel)
	if cfg.Debug == "1" {
		log.SetLevel(log.DebugLevel)
	}

	return &Logger{
		log.WithField("app_name", "admin-api"),
	}
}

func (l *Logger) Debug(all ...interface{}) {
	l.logger.Debug(all...)
}

func (l *Logger) Info(all ...interface{}) {
	l.logger.Info(all...)
}

func (l *Logger) Warn(all ...interface{}) {
	l.logger.Warn(all...)
}

func (l *Logger) Error(all ...interface{}) {
	l.logger.Error(all...)
}
