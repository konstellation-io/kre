package middleware

import (
	"errors"
	"fmt"
	"github.com/labstack/echo"
	"net/http"
	"net/url"
	"regexp"
)

var measurementsURLRegexp = regexp.MustCompile("^/measurements/([^/]+)")

// ChronografProxy creates a reverse proxy to send the incoming request
// to one of the runtime's Chronograf service.
// The incoming request are like: "<api_base_url>/measurements/<runtime-name>/*"
// and the destination URLs: "http://chronograf.<runtime-name>/measurements/<runtime-name>/*"
func ChronografProxy() echo.MiddlewareFunc {
	return NewReverseProxyWithDynamicURLTarget(func(req *http.Request) (*url.URL, error) {
		matches := measurementsURLRegexp.FindStringSubmatch(req.URL.Path)
		if matches == nil {
			return nil, errors.New("required runtime path param not found")
		}

		runtime := matches[1]
		return url.Parse(fmt.Sprintf("http://chronograf.%s", runtime))
	})
}
