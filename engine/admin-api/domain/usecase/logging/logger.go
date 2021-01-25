package logging

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/logging_${GOFILE} -package=mocks

// Logger defines how to logging in the application.
type Logger interface {
	Debug(msg string)
	Info(msg string)
	Warn(msg string)
	Error(msg string)
	Debugf(format string, a ...interface{})
	Infof(format string, a ...interface{})
	Warnf(format string, a ...interface{})
	Errorf(format string, a ...interface{})
}
