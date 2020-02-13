# Generate proto
FROM grpc/go as protobuf

WORKDIR /app

COPY scripts scripts
COPY proto proto

RUN ./scripts/generate_proto.sh


# Build k8s-manager
FROM golang:1.13 as builder

ENV CGO_ENABLED=0

WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN rm -rf /app/proto
COPY --from=protobuf /app/proto/ /app/proto/

RUN go build -o k8s-manager .


# Final image
FROM alpine:3.10.2

RUN mkdir -p /var/log/app

WORKDIR /app
COPY --from=builder /app/k8s-manager .
COPY config.yml .
COPY assets ./assets

CMD ["sh","-c","/app/k8s-manager 2>&1 | tee -a /var/log/app/app.log"]
