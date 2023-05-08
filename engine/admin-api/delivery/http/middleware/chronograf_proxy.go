package middleware

import (
	"net/url"

	"github.com/labstack/echo"
)

// ChronografProxy creates a reverse proxy to send the incoming request
// to one of the runtime's Chronograf service.
// The incoming request are like: "<api_base_url>/measurements/<runtime-name>/*"
// and the destination URLs: "http://chronograf.<runtime-name>/measurements/<runtime-name>/*"
func ChronografProxy(chronografAddress string) echo.MiddlewareFunc {
	destinationURL, _ := url.Parse(chronografAddress)
	return NewReverseProxyWithDynamicURLTarget(destinationURL)
}
