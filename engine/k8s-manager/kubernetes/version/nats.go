package version

import (
	"github.com/konstellation-io/kre/engine/k8s-manager/proto/versionpb"
	"github.com/nats-io/nats.go"
)

func createNatsStream(runtimeID, versionName, ns string, workflow *versionpb.Workflow) error {
	// TODO
	// Currently the endpoint is the responsible of the creation of the streams nad their wildcard sybjects
	return nil
}

func deleteNatsStream(runtimeID, versionName, workflowEntrypoint string) error {
	conn, err := nats.Connect(natsURL)
	if err != nil {
		return err
	}
	defer conn.Close()

	js, err := conn.JetStream()
	if err != nil {
		return err
	}

	err = js.DeleteStream(getStreamName(runtimeID, versionName, workflowEntrypoint))
	if err != nil {
		return err
	}

	return nil
}
