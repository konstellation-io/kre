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

// ChronografProxy creates a reverse proxy to send the incoming request
// to one of the runtime's Chronograf service.
// The incoming request are like: "<api_base_url>/database/<runtime-name>/*"
// and the destination URLs: "http://chronograf.<runtime-name>/database/<runtime-name>/*"
func MongoExpressProxy() echo.MiddlewareFunc {
	return NewReverseProxyWithDynamicURLTarget(func(req *http.Request) (*url.URL, error) {
		matches := databaseURLRegexp.FindStringSubmatch(req.URL.Path)
		if matches == nil {
			return nil, errors.New("required runtime path param not found")
		}

		runtime := matches[1]
		destinationURL, _ := url.Parse(fmt.Sprintf("http://kre-mongo-express.%s", runtime))
		fmt.Println(destinationURL)
		return destinationURL, nil
	})
}
