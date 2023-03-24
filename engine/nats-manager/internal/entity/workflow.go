package entity

import (
	"fmt"

	"github.com/konstellation-io/kre/engine/nats-manager/internal/errors"
)

type Workflow struct {
	Name       string
	Entrypoint string
	Nodes      []*Node
}

func (w *Workflow) Validate() error {
	if w.Name == "" {
		return errors.ErrEmptyWorkflow
	}

	if w.Entrypoint == "" {
		return errors.ErrEmptyEntrypointService
	}

	for _, node := range w.Nodes {
		if err := node.Validate(); err != nil {
			return fmt.Errorf("invalid node: %w", err)
		}
	}

	return nil
}
