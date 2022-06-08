package parser_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/engine/mongo-writer/internal/parser"
)

func TestFluentbitMsgParser_Parse(t *testing.T) {
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
			"runtimeId":    "runtime-id",
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
			"runtimeId":    "runtime-id",
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
			"runtimeId":    "runtime-id",
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
			WorkflowID:   "entrypoint",
			WorkflowName: "entrypoint",
			NodeID:       "entrypoint",
			NodeName:     "entrypoint",
			VersionID:    "60d0b4d389a76e646f1f66b7",
			RuntimeID:    "runtime-id",
			VersionName:  "greeter-v1",
		},
		{
			Date:         "2021-06-24T10:50:18+0000",
			Level:        "INFO",
			Message:      "Starting request/reply on NATS subject: 'greeter-v1-PyGreet-entrypoint'",
			WorkflowID:   "entrypoint",
			WorkflowName: "entrypoint",
			NodeID:       "entrypoint",
			NodeName:     "entrypoint",
			VersionID:    "60d0b4d389a76e646f1f66b7",
			RuntimeID:    "runtime-id",
			VersionName:  "greeter-v1",
		},
		{
			Date:         "2021-06-24T10:50:18+0000",
			Level:        "INFO",
			Message:      "creating a response from message reply",
			WorkflowID:   "entrypoint",
			WorkflowName: "entrypoint",
			NodeID:       "entrypoint",
			NodeName:     "entrypoint",
			VersionID:    "60d0b4d389a76e646f1f66b7",
			RuntimeID:    "runtime-id",
			VersionName:  "greeter-v1",
		},
	}

	fbParser := parser.NewFluentbitMsgParser()
	result, err := fbParser.Parse([]byte(input))
	require.NoError(t, err)

	require.Equal(t, expectedResult, result)
}
