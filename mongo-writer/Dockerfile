FROM golang:1.12 as builder

# Build the binary statically.
ENV CGO_ENABLED=0

WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o mongo-writer .


FROM alpine:3.10.2

RUN apk add -U --no-cache ca-certificates
RUN mkdir -p /var/log/app

WORKDIR /app
COPY --from=builder /app/mongo-writer .
COPY config.yml .

CMD ["sh","-c","/app/mongo-writer 2>&1 | tee -a /var/log/app/app.log"]
