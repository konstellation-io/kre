package version

//go:generate mockgen -source=${GOFILE} -destination=../../../mocks/version_${GOFILE} -package=mocks

type DocGenerator interface {
	Generate(versionName, docFolder string) error
}
