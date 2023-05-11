package repository

//go:generate mockgen -source=${GOFILE} -destination=../../mocks/repo_${GOFILE} -package=mocks

type MeasurementRepo interface {
	CreateDatabase(runtimeID string) error
}
