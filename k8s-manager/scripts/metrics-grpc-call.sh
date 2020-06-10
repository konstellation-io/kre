#!/bin/sh

PAYLOAD=$(cat << EndOfMessage
{
  "versionName":"tnba-v1-1-0",
  "namespace": "kre-mettel",
  "fromDate": "2020-06-10T01:00:00.000Z",
  "toDate": "2020-06-10T23:51:00.000Z",
  "step": 300
}
EndOfMessage
)

echo $PAYLOAD | grpcurl -plaintext -max-time 5 -d @ localhost:50051 resourcemetrics.ResourceMetricsService/GetVersion
