package version_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/version"

	adapterVersion "github.com/konstellation-io/kre/engine/admin-api/adapter/version"
)

var entrypoint = entity.Entrypoint{
	ProtoFile: "mock",
	Image:     "konstellation/mock:latest",
	Src:       "mock",
}

var testNode1 = entity.Node{
	ID:            "node1",
	Name:          "node1",
	Image:         "konstellation/mock:latest",
	Src:           "mock",
	GPU:           false,
	Subscriptions: nil,
}

var testNode2 = entity.Node{
	ID:            "node2",
	Name:          "node2",
	Image:         "konstellation/mock:latest",
	Src:           "mock",
	GPU:           false,
	Subscriptions: nil,
}

var testNode3 = entity.Node{
	ID:            "node3",
	Name:          "node3",
	Image:         "konstellation/mock:latest",
	Src:           "mock",
	GPU:           false,
	Subscriptions: nil,
}

var edge1 = entity.Edge{
	ID:       "edge1",
	FromNode: testNode1.ID,
	ToNode:   testNode2.ID,
}

var edge2 = entity.Edge{
	ID:       "edge2",
	FromNode: testNode2.ID,
	ToNode:   testNode3.ID,
}

var testWorkflow1 = entity.Workflow{
	ID:         "testWorkflow1",
	Name:       "Test Workflow 1",
	Entrypoint: "TestEntrypoint",
	Nodes:      []entity.Node{testNode1, testNode2, testNode3},
	Edges:      []entity.Edge{edge1, edge2},
	Exitpoint:  "",
}

func TestTranslateToKrtVersionV2(t *testing.T) {
	// GIVEN a mocked test version krtV1
	var testVersion = entity.Version{
		ID:          "mockID",
		KrtVersion:  "",
		Name:        "test-version",
		Description: "Testing version",
		Entrypoint:  entrypoint,
		Workflows: []*entity.Workflow{
			&testWorkflow1,
		},
	}

	// WHEN we translate said version to krtV2
	translator := version.NewTranslator(adapterVersion.NewIDGenerator())
	translator.TranslateToKrtVersionV2(&testVersion)

	// THEN expect a single wokflow has been translated
	require.Len(t, testVersion.Workflows, 1)
	testWorkflow := testVersion.Workflows[0]

	// AND the konstellation default exitpoint has been assigned as the workflow's exitpoint
	require.Equal(t, "konstellation-exitpoint", testWorkflow.Exitpoint)

	for idx := 0; idx != len(testWorkflow.Nodes)-1; idx++ {
		node := testWorkflow.Nodes[idx]
		require.Len(t, node.Subscriptions, 1)
		subscription := node.Subscriptions[0]
		if idx == 0 {
			// AND the first node has been subscribed to the entrypoint
			require.Equal(t, "entrypoint", subscription)
		} else {
			// AND the following nodes except exitpoint have been subscribed to the previous node
			require.Equal(t, testWorkflow.Nodes[idx-1].Name, subscription)
		}
	}

	// AND exitpoint has been subscribed to all
	node := testWorkflow.Nodes[len(testWorkflow.Nodes)-1]
	exitpointSubscritpions := []string{testNode1.Name, testNode2.Name, testNode3.Name}
	require.Equal(t, exitpointSubscritpions, node.Subscriptions)
}
