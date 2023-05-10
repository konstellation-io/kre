package middleware

import (
	"net/url"

	"github.com/labstack/echo"
)

// MongoExpressProxy creates a reverse proxy to send the incoming request
// to one of the runtime's MongoExpress service.
// The incoming request are like: "<api_base_url>/database/<runtime-name>/*"
// and the destination URLs: "http://kre-mongo-express.<k8s-namespace>/database/<runtime-name>/*"
func MongoExpressProxy(mongoExpressAddress string) echo.MiddlewareFunc {
	destinationURL, _ := url.Parse(mongoExpressAddress)
	return NewReverseProxyWithDynamicURLTarget(destinationURL)
}
