package logging

import (
	"os"

	log "github.com/sirupsen/logrus"
)

type Logger struct {
	logger *log.Entry
}

// NewLogger creates a new logrus logger instance.
func NewLogger() *Logger {
	// Log as JSON instead of the default ASCII formatter.
	log.SetFormatter(&log.JSONFormatter{})

	// Output to stdout instead of the default stderr
	// Can be any io.Writer, see below for File example
	log.SetOutput(os.Stdout)

	// Only log the warning severity or above.
	log.SetLevel(log.InfoLevel)

	return &Logger{
		log.WithField("app_name", "admin-api"),
	}
}

func (l *Logger) Info(msg string) {
	l.logger.Info(msg)
}

func (l *Logger) Warn(msg string) {
	l.logger.Warn(msg)
}

func (l *Logger) Error(msg string) {
	l.logger.Error(msg)
}
