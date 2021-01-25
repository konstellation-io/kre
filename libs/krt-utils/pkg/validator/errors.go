package validator

import (
	"bytes"
	"strings"
)

// ValidationErrors is an array of Error's to store multiple error messages post validation.
// NOTE: this technique based on github.com/go-playground/validator.
type ValidationErrors []error

// Error method allows ValidationErrors to subscribe to the Error interface.
func (ve ValidationErrors) Error() string {
	buff := bytes.NewBufferString("")

	var e error

	for i := 0; i < len(ve); i++ {
		e = ve[i]
		buff.WriteString(e.Error())
		buff.WriteString("\n")
	}

	return strings.TrimSpace(buff.String())
}
