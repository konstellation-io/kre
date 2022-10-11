package middleware

import (
	"net/url"
	"regexp"

	"github.com/labstack/echo"
)

var databaseURLRegexp = regexp.MustCompile("^/database/([^/]+)")

// MongoExpressProxy creates a reverse proxy to send the incoming request
// to one of the runtime's MongoExpress service.
// The incoming request are like: "<api_base_url>/database/<runtime-name>/*"
// and the destination URLs: "http://kre-mongo-express.<k8s-namespace>/database/<runtime-name>/*"
func MongoExpressProxy(mongoExpressAddress string) echo.MiddlewareFunc {
	detinationURL, _ := url.Parse(mongoExpressAddress)
	return NewReverseProxyWithDynamicURLTarget(detinationURL)
}
