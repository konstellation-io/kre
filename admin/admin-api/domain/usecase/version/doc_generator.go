package version

type DocGenerator interface {
	Generate(versionID, docFolder string) error
}
