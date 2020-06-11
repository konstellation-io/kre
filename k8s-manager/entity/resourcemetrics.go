package entity

import (
	"time"

	"gitlab.com/konstellation/kre/k8s-manager/proto/resourcemetricspb"
)

// InputVersionResourceMetrics export as entity
type InputVersionResourceMetrics struct {
	resourcemetricspb.VersionRequest
	// TODO define each field to uncouple from proto
}

// VersionResourceMetrics basic object with cpu and mem values
type VersionResourceMetrics struct {
	Date time.Time
	CPU  float64
	Mem  float64
}
