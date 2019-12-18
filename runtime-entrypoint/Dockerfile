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
COPY . .
RUN rm -rf /app/proto
COPY --from=protobuf /app/proto/*.go /app/proto/

RUN go build -o entrypoint .


# Final image
FROM alpine:3.9.2

RUN mkdir -p /var/log/app

WORKDIR /app
COPY --from=builder /app/entrypoint .

CMD ["sh","-c","/app/entrypoint 2>&1 | tee -a /var/log/app/app.log"]
