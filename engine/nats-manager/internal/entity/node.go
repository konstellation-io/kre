package entity

import (
	"fmt"

	"github.com/konstellation-io/kre/engine/nats-manager/internal/errors"
)

type Node struct {
	Name          string
	Subscriptions []string
	ObjectStore   *ObjectStore
}

func (n *Node) Validate() error {
	if n.Name == "" {
		return errors.ErrEmptyNodeName
	}

	if n.ObjectStore == nil {
		return nil
	}

	if err := n.ObjectStore.Validate(); err != nil {
		return fmt.Errorf("invalid node object store: %w", err)
	}

	return nil
}
