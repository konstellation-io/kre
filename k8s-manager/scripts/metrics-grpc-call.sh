#!/bin/sh

PAYLOAD=$(cat << EndOfMessage
{
  "VersionName":"tnba-v1-1-0",
  "Namespace": "kre-mettel",
  "FromDate": "2020-06-10T01:00:00.000Z",
  "ToDate": "2020-06-10T23:51:00.000Z",
  "Step": 300
}
EndOfMessage
)

echo $PAYLOAD | grpcurl -plaintext -max-time 5 -d @ localhost:50051 resourcemetrics.ResourceMetricsService/GetVersion
