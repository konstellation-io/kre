package controller

import (
	"github.com/labstack/echo"
	"net/http"
)

type HttpErrorWithCode struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func NewHTTPError(statusCode int, code, message string) *echo.HTTPError {
	return echo.NewHTTPError(statusCode, HttpErrorWithCode{code, message})
}

var (
	// HTTPErrUnexpected captures all unknown errors.
	HTTPErrUnexpected = NewHTTPError(http.StatusInternalServerError, "unexpected_error", "Unexpected error")

	// HTTPErrInvalidJSON captures common decode error when binding request body to a data struct.
	HTTPErrInvalidJSON = NewHTTPError(http.StatusBadRequest, "invalid_json", "Invalid JSON")

	HTTPErrVerificationCodeNotFound = NewHTTPError(http.StatusBadRequest, "invalid_verification_code", "The verification code has expired or is not valid.")
)
