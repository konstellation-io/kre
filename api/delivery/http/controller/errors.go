package controller

import (
	"github.com/labstack/echo"
	"net/http"
)

var (
	// UnexpectedError captures all unknown errors.
	UnexpectedError = echo.NewHTTPError(http.StatusInternalServerError, "Unexpected error")

	// InvalidJSONError captures common decode error when binding request body to a data struct.
	InvalidJSONError = echo.NewHTTPError(http.StatusBadRequest, "Invalid JSON")
)
