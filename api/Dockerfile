FROM golang:1.12 as builder

# Build the binary statically.
ENV CGO_ENABLED=0

WORKDIR /app
COPY . .
RUN go build -o api .


FROM alpine:3.9.2

RUN mkdir -p /var/log/app

WORKDIR /app
COPY --from=builder /app/api .
COPY config.yml .

CMD ["sh","-c","/app/api 2>&1 | tee -a /var/log/app/app.log"]
