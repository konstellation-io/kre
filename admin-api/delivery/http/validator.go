package http

import "github.com/go-playground/validator"

type customValidator struct {
	validator *validator.Validate
}

func (cv *customValidator) Validate(i interface{}) error {
	return cv.validator.Struct(i)
}

func newCustomValidator() *customValidator {
	return &customValidator{validator: validator.New()}
}
