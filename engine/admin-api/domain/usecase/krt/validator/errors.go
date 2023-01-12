package validator

import "strings"

type ValidationError struct {
	Messages []string
}

func NewValidationError(errs []error) ValidationError {
	return ValidationError{
		Messages: getErrorMessages(errs),
	}
}

func getErrorMessages(errs []error) []string {
	messages := make([]string, 0, len(errs))
	for _, err := range errs {
		messages = append(messages, err.Error())
	}
	return messages
}

func (e ValidationError) Error() string {
	return strings.Join(e.Messages, "\n")
}
