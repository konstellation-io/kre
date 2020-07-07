#!/bin/sh

VERSION_NAME="tnba-v1-1-0"
NAMESPACE="kre-mettel"

FROM_DATE=$(date -d '2 hour ago' --iso-8601=seconds -u)
NOW=$(date --iso-8601=seconds -u)
PAYLOAD=$(cat << EndOfMessage
{
  "versionName":"$VERSION_NAME",
  "namespace": "$NAMESPACE",
  "fromDate": "$FROM_DATE",
  "toDate": "$NOW",
  "step": 300
}
EndOfMessage
)

echo $PAYLOAD | grpcurl -plaintext -max-time 500 -d @ localhost:50051 resourcemetrics.ResourceMetricsService/GetVersion

PAYLOAD_WATCH=$(cat << EndOfMessage
{
  "versionName":"$VERSION_NAME",
  "namespace": "$NAMESPACE",
  "fromDate": "$NOW",
  "step": 300
}
EndOfMessage
)

echo $PAYLOAD | grpcurl -plaintext -max-time 500 -d @ localhost:50051 resourcemetrics.ResourceMetricsService/WatchVersion

