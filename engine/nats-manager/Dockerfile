# Generate proto
FROM namely/protoc-all as protobuf

WORKDIR /app

COPY scripts scripts

COPY proto proto

RUN ./scripts/generate_proto.sh


# Build k8s-manager
FROM golang:1.20.3-alpine3.17 as builder

ENV CGO_ENABLED=0

WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN rm -rf /app/proto
COPY --from=protobuf /app/proto/ /app/proto/

RUN go build -o nats-manager ./cmd


# Final image
FROM alpine:3.10.2

# Create kre user.
ENV USER=kre
ENV UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    "${USER}"

RUN mkdir -p /var/log/app

WORKDIR /app
COPY --from=builder /app/nats-manager .
#COPY config.yml .

RUN chown -R kre:0 /app \
    && chmod -R g+w /app \
    && chown -R kre:0 /var/log/app \
    && chmod -R g+w /var/log/app

USER kre

CMD ["sh","-c","/app/nats-manager 2>&1 | tee -a /var/log/app/app.log"]
