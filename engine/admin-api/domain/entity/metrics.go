package entity

type Metrics struct {
	Values *MetricsValues `json:"values"`
	Charts *MetricsCharts `json:"charts"`
}

type MetricsValues struct {
	Accuracy  *MetricsAccuracy `json:"accuracy"`
	Missing   int              `json:"missing"`
	NewLabels int              `json:"newLabels"`
}

type MetricsAccuracy struct {
	Total    int `json:"total"`
	Micro    int `json:"micro"`
	Macro    int `json:"macro"`
	Weighted int `json:"weighted"`
}

type MetricsCharts struct {
	ConfusionMatrix []*MetricChartData `json:"confusionMatrix"`
	SeriesAccuracy  []*MetricChartData `json:"seriesAccuracy"`
	SeriesRecall    []*MetricChartData `json:"seriesRecall"`
	SeriesSupport   []*MetricChartData `json:"seriesSupport"`
	SuccessVsFails  []*MetricChartData `json:"successVsFails"`
}

type MetricChartData struct {
	X string `json:"x"`
	Y string `json:"y"`
	Z string `json:"z"`
}

type ClassificationMetric struct {
	ID             string `bson:"_id"`
	VersionID      string `bson:"versionId"`
	Date           string `bson:"date"`
	Error          string `bson:"error"`
	PredictedValue string `bson:"predictedValue"`
	TrueValue      string `bson:"trueValue"`
}
