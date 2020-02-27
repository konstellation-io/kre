package logging

// Logger defines how to logging in the application.
type Logger interface {
	Info(msg string)
	Warn(msg string)
	Error(msg string)
	Infof(format string, a ...interface{})
	Warnf(format string, a ...interface{})
	Errorf(format string, a ...interface{})
}
