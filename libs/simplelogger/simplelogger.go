package simplelogger

import (
	"fmt"
	"io"
	"os"
	"regexp"
	"strings"
	"time"
)

type LogLevel int

const (
	LevelError LogLevel = iota
	LevelWarn
	LevelInfo
	LevelDebug
)

const DefaultLogLevel = LevelInfo

var stringToLogLevel = map[string]LogLevel{
	"ERROR": LevelError,
	"WARN":  LevelWarn,
	"INFO":  LevelInfo,
	"DEBUG": LevelDebug,
}

var logLevelToString = map[LogLevel]string{
	LevelError: "ERROR",
	LevelWarn:  "WARN",
	LevelInfo:  "INFO",
	LevelDebug: "DEBUG",
}

var lineBreakRE = regexp.MustCompile(`\r?\n`)

type SimpleLoggerInterface interface {
	Debug(msg string)
	Info(msg string)
	Warn(msg string)
	Error(msg string)
	Debugf(format string, a ...interface{})
	Infof(format string, a ...interface{})
	Warnf(format string, a ...interface{})
	Errorf(format string, a ...interface{})
}

type SimpleLogger struct {
	level  LogLevel
	writer io.Writer
}

// New creates a new SimpleLogger instance.
func New(level LogLevel) *SimpleLogger {
	return &SimpleLogger{
		level:  level,
		writer: os.Stdout,
	}
}

// NewWithWriter creates a new SimpleLogger instance.
func NewWithWriter(level LogLevel, writer io.Writer) *SimpleLogger {
	return &SimpleLogger{
		level,
		writer,
	}
}

func (l *SimpleLogger) printLog(level LogLevel, msg string) {
	if level > l.level {
		return
	}

	t := time.Now().Format(time.RFC3339Nano)
	_, _ = fmt.Fprintf(l.writer, "%s %s %s\n", t, logLevelToString[level], lineBreakRE.ReplaceAllLiteralString(msg, " "))
}

func (l *SimpleLogger) Debug(msg string) {
	l.printLog(LevelDebug, msg)
}

func (l *SimpleLogger) Info(msg string) {
	l.printLog(LevelInfo, msg)
}

func (l *SimpleLogger) Warn(msg string) {
	l.printLog(LevelWarn, msg)
}

func (l *SimpleLogger) Error(msg string) {
	l.printLog(LevelError, msg)
}

func (l *SimpleLogger) Debugf(format string, a ...interface{}) {
	l.printLog(LevelDebug, fmt.Sprintf(format, a...))
}

func (l *SimpleLogger) Infof(format string, a ...interface{}) {
	l.printLog(LevelInfo, fmt.Sprintf(format, a...))
}

func (l *SimpleLogger) Warnf(format string, a ...interface{}) {
	l.printLog(LevelWarn, fmt.Sprintf(format, a...))
}

func (l *SimpleLogger) Errorf(format string, a ...interface{}) {
	l.printLog(LevelError, fmt.Sprintf(format, a...))
}

// ConvertLogLevelFromString convert string to LogLevel type. If the string is not valid, the returned LogLevel is INFO.
func ConvertLogLevelFromString(logLevel string) LogLevel {
	level, ok := stringToLogLevel[strings.ToUpper(logLevel)]
	if !ok {
		return DefaultLogLevel
	}
	return level
}
