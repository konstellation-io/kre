FROM scratch

COPY nats-streaming-server /nats-streaming-server
COPY nats.conf /nats.conf
# Expose client and management ports
EXPOSE 4222 8222

# Run with default memory based store 
ENTRYPOINT ["/nats-streaming-server"]
CMD ["-c", "/nats.conf"]
