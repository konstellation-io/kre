package entity

import (
	"time"

	"gitlab.com/konstellation/kre/k8s-manager/proto/resourcemetricspb"
)

// InputVersionResourceMetrics export as entity
type InputVersionResourceMetrics struct {
	resourcemetricspb.VersionRequest
}

type VersionResourceMetrics struct {
	Date time.Time
	CPU float64
	Mem	float64
}
