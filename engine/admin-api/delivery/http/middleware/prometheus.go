package middleware

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"strings"

	"github.com/labstack/echo/v4"
	prom "github.com/prometheus/client_golang/prometheus"
)

var TotalRequestCounter = prom.NewCounterVec(
	prom.CounterOpts{
		Name: "graphql_request_total",
		Help: "Total number of requests completed on the graphql server.",
	}, []string{"operation", "runtimeID"},
)

type body struct {
	OperationName string `json:"operationName"`
	Variables     struct {
		RuntimeId string `json:"runtimeId"`
	} `json:"variables"`
}

func UrlSkipper(c echo.Context) bool {
	if strings.HasPrefix(c.Path(), "/graphql") {
		return true
	}
	return false
}

func NewGraphQlMetricsMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) (err error) {

			reqBody := &body{}

			// Read the stream and save it in a buffer to be used later by the next middleware
			data, err := io.ReadAll(c.Request().Body)
			c.Request().Body = io.NopCloser(bytes.NewBuffer(data))

			if len(data) == 0 {
				return next(c)
			}

			if err != nil {
				fmt.Println(err)
				if errors.Is(err, io.EOF) {
					return next(c)
				}
				return err
			}

			err = json.Unmarshal(data, reqBody)

			fmt.Println(reqBody)

			if err != nil {
				fmt.Println(err)
			}

			TotalRequestCounter.WithLabelValues(
				reqBody.OperationName, reqBody.Variables.RuntimeId).Inc()

			return next(c)
		}
	}
}
