package entity

type ResourceMetrics struct {
	Date string  `json:"date"`
	Cpu  float64 `json:"cpu"`
	Mem  float64 `json:"mem"`
}
