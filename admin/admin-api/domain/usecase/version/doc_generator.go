package version

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/version_${GOFILE} -package=mocks

type DocGenerator interface {
	Generate(versionID, docFolder string) error
}
