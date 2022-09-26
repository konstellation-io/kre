package version_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/version"
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

	version.TranslateToKrtVersionV2(&testVersion)

	require.Len(t, testVersion.Workflows, 1)
	testWorkflow := testVersion.Workflows[0]

	require.Equal(t, testNode3.Name, testWorkflow.Exitpoint)

	for idx, node := range testWorkflow.Nodes {
		require.Len(t, node.Subscriptions, 1)
		subscription := node.Subscriptions[0]
		if idx == 0 {
			require.Equal(t, "entrypoint", subscription) // first node should be subscribed to entrypoint
		} else {
			require.Equal(t, testWorkflow.Nodes[idx-1].Name, subscription) // following nodes should be subcribed to previous node
		}
	}
}
