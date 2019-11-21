# Generate proto
FROM grpc/go as protobuf

WORKDIR /app

COPY scripts scripts
COPY runtimepb runtimepb

RUN ./scripts/generate_proto.sh


# Build k8s-resource-manager
FROM golang:1.13 as builder

ENV CGO_ENABLED=0

WORKDIR /app
COPY . .
RUN rm -rf /app/runtimepb
COPY --from=protobuf /app/runtimepb/*.go /app/runtimepb/

RUN go build -o k8s-resource-manager .


# Final image
FROM alpine:3.9.2

RUN mkdir -p /var/log/app

WORKDIR /app
COPY --from=builder /app/k8s-resource-manager .
COPY config.yml .
COPY assets ./assets

CMD ["sh","-c","/app/k8s-resource-manager 2>&1 | tee -a /var/log/app/app.log"]
