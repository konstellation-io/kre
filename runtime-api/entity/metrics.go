package entity

type ClassificationMetric struct {
	ID             string `bson:"_id"`
	VersionID      string `bson:"versionId"`
	Date           string `bson:"date"` // TODO should be time.Time type
	Error          string `bson:"error"`
	PredictedValue string `bson:"predictedValue"`
	TrueValue      string `bson:"trueValue"`
}
