package middleware

import (
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/labstack/echo/v4"
)

type GetTargetURL = func(req *http.Request) (*url.URL, error)

// NewReverseProxyWithDynamicURLTarget creates a reverse proxy Echo middleware
// that instead of having a static list of target URLs gets the target URL dynamically
// depending of the request information.
func NewReverseProxyWithDynamicURLTarget(targetURL *url.URL) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) (err error) {
			req := c.Request()
			res := c.Response()

			// Fix header
			if req.Header.Get(echo.HeaderXRealIP) == "" {
				req.Header.Set(echo.HeaderXRealIP, c.RealIP())
			}
			if req.Header.Get(echo.HeaderXForwardedProto) == "" {
				req.Header.Set(echo.HeaderXForwardedProto, c.Scheme())
			}
			if c.IsWebSocket() && req.Header.Get(echo.HeaderXForwardedFor) == "" { // For HTTP, it is automatically set by Go HTTP reverse proxy.
				req.Header.Set(echo.HeaderXForwardedFor, c.RealIP())
			}

			// Proxy
			switch {
			case c.IsWebSocket():
				proxyRaw(targetURL, c).ServeHTTP(res, req)
			case req.Header.Get(echo.HeaderAccept) == "text/event-stream":
			default:
				proxyHTTP(targetURL, c).ServeHTTP(res, req)
			}

			return
		}
	}
}

func proxyHTTP(targetURL *url.URL, c echo.Context) http.Handler {
	proxy := httputil.NewSingleHostReverseProxy(targetURL)
	proxy.ErrorHandler = func(resp http.ResponseWriter, req *http.Request, err error) {
		c.Logger().Errorf("remote %s unreachable, could not forward: %v", targetURL.String(), err)
		c.Error(echo.NewHTTPError(http.StatusServiceUnavailable))
	}
	return proxy
}

func proxyRaw(targetURL *url.URL, c echo.Context) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		in, _, err := c.Response().Hijack()
		if err != nil {
			c.Error(fmt.Errorf("proxy raw, hijack error=%v, url=%s", targetURL, err))
			return
		}
		defer in.Close()

		out, err := net.Dial("tcp", targetURL.Host)
		if err != nil {
			he := echo.NewHTTPError(http.StatusBadGateway, fmt.Sprintf("proxy raw, dial error=%v, url=%s", targetURL, err))
			c.Error(he)
			return
		}
		defer out.Close()

		// Write header
		err = r.Write(out)
		if err != nil {
			he := echo.NewHTTPError(http.StatusBadGateway, fmt.Sprintf("proxy raw, request header copy error=%v, url=%s", targetURL, err))
			c.Error(he)
			return
		}

		errCh := make(chan error, 2)
		cp := func(dst io.Writer, src io.Reader) {
			_, err = io.Copy(dst, src)
			errCh <- err
		}

		go cp(out, in)
		go cp(in, out)
		err = <-errCh
		if err != nil && err != io.EOF {
			c.Logger().Errorf("proxy raw, copy body error=%v, url=%s", targetURL, err)
		}
	})
}
