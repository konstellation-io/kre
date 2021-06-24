package parser_test

import (
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/parser"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestFluentbitMsgParser(t *testing.T) {
	input := `
[
  [
    1624531818.612605,
    {
      "tag": "mongo_writer_logs",
      "logtime": "2021-06-24T10:50:18+0000",
      "level": "INFO",
      "capture": "gRPC message received",
      "versionId": "60d0b4d389a76e646f1f66b7",
      "versionName": "greeter-v1",
      "nodeName": "entrypoint",
      "nodeId": "entrypoint",
      "workflowName": "entrypoint",
      "workflowId": "entrypoint"
    }
  ],
  [
    1624531818.612638,
    {
      "tag": "mongo_writer_logs",
      "logtime": "2021-06-24T10:50:18+0000",
      "level": "INFO",
      "capture": "Starting request/reply on NATS subject: 'greeter-v1-PyGreet-entrypoint'",
      "versionId": "60d0b4d389a76e646f1f66b7",
      "versionName": "greeter-v1",
      "nodeName": "entrypoint",
      "nodeId": "entrypoint",
      "workflowName": "entrypoint",
      "workflowId": "entrypoint"
    }
  ],
  [
    1624531818.884247,
    {
      "tag": "mongo_writer_logs",
      "logtime": "2021-06-24T10:50:18+0000",
      "level": "INFO",
      "capture": "creating a response from message reply",
      "versionId": "60d0b4d389a76e646f1f66b7",
      "versionName": "greeter-v1",
      "nodeName": "entrypoint",
      "nodeId": "entrypoint",
      "workflowName": "entrypoint",
      "workflowId": "entrypoint"
    }
  ]
]
`

	expectedResult := []parser.LogMsg{
		{
			Date:         "2021-06-24T10:50:18+0000",
			Level:        "INFO",
			Message:      "gRPC message received",
			WorkflowId:   "entrypoint",
			WorkflowName: "entrypoint",
			NodeId:       "entrypoint",
			NodeName:     "entrypoint",
			VersionId:    "60d0b4d389a76e646f1f66b7",
			VersionName:  "greeter-v1",
		},
		{
			Date:         "2021-06-24T10:50:18+0000",
			Level:        "INFO",
			Message:      "Starting request/reply on NATS subject: 'greeter-v1-PyGreet-entrypoint'",
			WorkflowId:   "entrypoint",
			WorkflowName: "entrypoint",
			NodeId:       "entrypoint",
			NodeName:     "entrypoint",
			VersionId:    "60d0b4d389a76e646f1f66b7",
			VersionName:  "greeter-v1",
		},
		{
			Date:         "2021-06-24T10:50:18+0000",
			Level:        "INFO",
			Message:      "creating a response from message reply",
			WorkflowId:   "entrypoint",
			WorkflowName: "entrypoint",
			NodeId:       "entrypoint",
			NodeName:     "entrypoint",
			VersionId:    "60d0b4d389a76e646f1f66b7",
			VersionName:  "greeter-v1",
		},
	}

	result, err := parser.FluentbitMsgParser([]byte(input))
	require.NoError(t, err)

	require.Equal(t, expectedResult, result)
}
