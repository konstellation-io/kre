package controller

import (
	"github.com/go-playground/locales/en"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator"
)

var universalTranslator *ut.UniversalTranslator

func init() {
	enLocale := en.New()
	universalTranslator = ut.New(enLocale, enLocale)
}

type responseValidationError struct {
	Code             string            `json:"code"`
	Message          string            `json:"message"`
	ValidationErrors []validationError `json:"errors"`
}

type validationError struct {
	Field       string `json:"field"`
	Type        string `json:"type"`
	Description string `json:"description"`
}

func newResponseValidationError(err error) *responseValidationError {
	res := &responseValidationError{}
	res.Code = "validation_error"
	res.Message = "Invalid data"

	validationErrors := err.(validator.ValidationErrors)
	translator, _ := universalTranslator.GetTranslator("en")

	for _, e := range validationErrors {
		res.ValidationErrors = append(res.ValidationErrors, validationError{
			Field:       e.Field(),
			Type:        e.ActualTag(),
			Description: e.Translate(translator),
		})
	}

	return res
}
