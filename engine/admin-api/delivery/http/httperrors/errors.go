package httperrors

import (
	"net/http"

	"github.com/labstack/echo"
)

type HTTPErrorWithCode struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func newHTTPError(statusCode int, code, message string) *echo.HTTPError {
	return echo.NewHTTPError(statusCode, HTTPErrorWithCode{code, message})
}

//nolint:gochecknoglobals // This is a list of common errors to be used in the code.
var (
	// HTTPErrUnexpected captures all unknown errors.
	HTTPErrUnexpected = newHTTPError(http.StatusInternalServerError, "unexpected_error", "Unexpected error")

	// HTTPErrInvalidJSON captures common decode error when binding request body to a data struct.
	HTTPErrInvalidJSON = newHTTPError(http.StatusBadRequest, "invalid_json", "Invalid JSON")

	HTTPErrVerificationCodeNotFound = newHTTPError(http.StatusBadRequest, "invalid_verification_code",
		"The verification code has expired or is not valid.")

	HTTPErrUserNotAllowed = newHTTPError(http.StatusForbidden, "user_not_allowed", "Email domain not allowed")

	HTTPErrInvalidSession = newHTTPError(http.StatusUnauthorized, "invalid_session", "The session is not valid")

	HTTPErrUnauthorized = newHTTPError(http.StatusUnauthorized, "unauthorized", "Unauthorized")
)
