FROM golang:1.12 as builder

# Build the binary statically.
ENV CGO_ENABLED=0

WORKDIR /app
COPY . .
RUN go build -o runtime-api .


FROM alpine:3.9.2

RUN apk add -U --no-cache ca-certificates
RUN mkdir -p /var/log/app

WORKDIR /app
COPY --from=builder /app/runtime-api .
COPY config.yml .

CMD ["sh","-c","/app/runtime-api 2>&1 | tee -a /var/log/app/app.log"]
