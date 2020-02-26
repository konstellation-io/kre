package simplelogger_test

import (
	"fmt"
	"gitlab.com/konstellation/kre/libs/simplelogger"
	"io/ioutil"
	"os"
	"regexp"
	"testing"
)

func captureOutput(f func()) string {
	rescueStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	f()

	err := w.Close()
	if err != nil {
		panic(err)
	}

	out, _ := ioutil.ReadAll(r)
	os.Stdout = rescueStdout

	return string(out)
}

func assertEqual(t *testing.T, output, expectedOutput string) {
	if output != expectedOutput {
		t.Fatalf("Output: \"%s\" is not equal to: \"%s\"", output, expectedOutput)
	}
}

func assertLoggedMsg(t *testing.T, output, level, msg string) {
	expectedOutput := fmt.Sprintf("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\+\\d{2}:\\d{2} %s %s\n", level, msg)
	match, _ := regexp.MatchString(expectedOutput, output)
	if !match {
		t.Fatalf("Output: \"%s\" Does not match: \"%s\"", output, expectedOutput)
	}
}

func TestLevelDebugLogger(t *testing.T) {
	level := simplelogger.New(simplelogger.LevelDebug)
	msg := "test message"

	output := captureOutput(func() {
		level.Error(msg)
	})
	assertLoggedMsg(t, output, "ERROR", msg)

	output = captureOutput(func() {
		level.Warn(msg)
	})
	assertLoggedMsg(t, output, "WARN", msg)

	output = captureOutput(func() {
		level.Info(msg)
	})
	assertLoggedMsg(t, output, "INFO", msg)

	output = captureOutput(func() {
		level.Debug(msg)
	})
	assertLoggedMsg(t, output, "DEBUG", msg)
}

func TestLevelInfoLogger(t *testing.T) {
	level := simplelogger.New(simplelogger.LevelInfo)
	msg := "test message"

	output := captureOutput(func() {
		level.Error(msg)
	})
	assertLoggedMsg(t, output, "ERROR", msg)

	output = captureOutput(func() {
		level.Warn(msg)
	})
	assertLoggedMsg(t, output, "WARN", msg)

	output = captureOutput(func() {
		level.Info(msg)
	})
	assertLoggedMsg(t, output, "INFO", msg)

	output = captureOutput(func() {
		level.Debug(msg)
	})
	assertEqual(t, output, "")
}

func TestLevelWarnLogger(t *testing.T) {
	level := simplelogger.New(simplelogger.LevelWarn)
	msg := "test message"

	output := captureOutput(func() {
		level.Error(msg)
	})
	assertLoggedMsg(t, output, "ERROR", msg)

	output = captureOutput(func() {
		level.Warn(msg)
	})
	assertLoggedMsg(t, output, "WARN", msg)

	output = captureOutput(func() {
		level.Info(msg)
	})
	assertEqual(t, output, "")

	output = captureOutput(func() {
		level.Debug(msg)
	})
	assertEqual(t, output, "")
}

func TestLevelErrorLogger(t *testing.T) {
	level := simplelogger.New(simplelogger.LevelError)
	msg := "test message"

	output := captureOutput(func() {
		level.Error(msg)
	})
	assertLoggedMsg(t, output, "ERROR", msg)

	output = captureOutput(func() {
		level.Warn(msg)
	})
	assertEqual(t, output, "")

	output = captureOutput(func() {
		level.Info(msg)
	})
	assertEqual(t, output, "")

	output = captureOutput(func() {
		level.Debug(msg)
	})
	assertEqual(t, output, "")
}

func TestLoggerWithFormatters(t *testing.T) {
	level := simplelogger.New(simplelogger.LevelDebug)
	msg := "test formatted message: %s %s"
	arg1 := "some value"
	arg2 := "another value"

	output := captureOutput(func() {
		level.Errorf(msg, arg1, arg2)
	})
	assertLoggedMsg(t, output, "ERROR", fmt.Sprintf(msg, arg1, arg2))

	output = captureOutput(func() {
		level.Warnf(msg, arg1, arg2)
	})
	assertLoggedMsg(t, output, "WARN", fmt.Sprintf(msg, arg1, arg2))

	output = captureOutput(func() {
		level.Infof(msg, arg1, arg2)
	})
	assertLoggedMsg(t, output, "INFO", fmt.Sprintf(msg, arg1, arg2))

	output = captureOutput(func() {
		level.Debugf(msg, arg1, arg2)
	})
	assertLoggedMsg(t, output, "DEBUG", fmt.Sprintf(msg, arg1, arg2))
}
