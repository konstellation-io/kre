package logging

import (
	"fmt"
)

type Logger struct {
}

// NewLogger creates a new logger instance.
func NewLogger() *Logger {
	return &Logger{}
}

func (l *Logger) Info(msg string) {
	fmt.Println("INFO ", msg)
}

func (l *Logger) Warn(msg string) {
	fmt.Println("WARN ", msg)
}

func (l *Logger) Error(msg string) {
	fmt.Println("ERROR ", msg)
}

func (l *Logger) Infof(format string, a ...interface{}) {
	fmt.Printf(fmt.Sprintf("INFO %s\n", format), a...)
}

func (l *Logger) Warnf(format string, a ...interface{}) {
	fmt.Printf(fmt.Sprintf("WARN %s\n", format), a...)
}

func (l *Logger) Errorf(format string, a ...interface{}) {
	fmt.Printf(fmt.Sprintf("ERROR %s\n", format), a...)
}
