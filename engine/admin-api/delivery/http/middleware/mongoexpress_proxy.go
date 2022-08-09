package middleware

import (
	"errors"
	"fmt"
	"net/http"
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
	return NewReverseProxyWithDynamicURLTarget(func(req *http.Request) (*url.URL, error) {
		matches := databaseURLRegexp.FindStringSubmatch(req.URL.Path)
		if matches == nil {
			return nil, errors.New("required runtime path param not found")
		}

		k8sNamespace := matches[1]
		destinationURL, _ := url.Parse(fmt.Sprintf("http://%s.%s", mongoExpressAddress, k8sNamespace))
		fmt.Println(destinationURL)
		return destinationURL, nil
	})
}
