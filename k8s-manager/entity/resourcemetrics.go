package entity

import (
	"time"

	"github.com/konstellation-io/kre/runtime/k8s-manager/proto/resourcemetricspb"
)

// InputVersionResourceMetrics export as entity.
type InputVersionResourceMetrics struct {
	resourcemetricspb.VersionRequest
}

// VersionResourceMetrics basic object with cpu and mem values.
type VersionResourceMetrics struct {
	Date time.Time
	CPU  float64
	Mem  float64
}
