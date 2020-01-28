# Generate proto
FROM grpc/go as protobuf

WORKDIR /app

COPY scripts scripts
COPY runtimepb runtimepb

RUN ./scripts/generate_proto.sh

# Build the binary statically.
FROM golang:1.12 as builder

ENV CGO_ENABLED=0

WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN rm -rf /app/runtimepb
COPY --from=protobuf /app/runtimepb/*.go /app/runtimepb/
RUN go build -o runtime-api .


FROM alpine:3.10.2

RUN apk add -U --no-cache ca-certificates
RUN mkdir -p /var/log/app

WORKDIR /app
COPY --from=builder /app/runtime-api .
COPY config.yml .

CMD ["sh","-c","/app/runtime-api 2>&1 | tee -a /var/log/app/app.log"]
