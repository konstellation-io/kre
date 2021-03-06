package version_test

import (
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/version"
	"github.com/konstellation-io/kre/engine/admin-api/mocks"
	"github.com/stretchr/testify/require"
)

func TestHTTPStaticDocGenerator_Generate(t *testing.T) {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	mocks.AddLoggerExpects(logger)

	docFolder, err := ioutil.TempDir("", "test-version-doc")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(docFolder) // clean up

	storageFolder, err := ioutil.TempDir("", "test-api-storage")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(storageFolder) // clean up

	cfg := &config.Config{}
	cfg.Admin.BaseURL = "http://api.local"
	cfg.Admin.StoragePath = storageFolder

	versionName := "version1234"

	readmeContent := []byte(`
# Example

## Image relative

This is an example:

![relative path image](./img/test.png)

## Image absolute

This is an example:

![absolute path image](https://absolute-url-example)

`)
	if err := ioutil.WriteFile(filepath.Join(docFolder, "README.md"), readmeContent, os.ModePerm); err != nil {
		t.Fatal(err)
	}

	expectedReadmeContent := []byte(`
# Example

## Image relative

This is an example:

![relative path image](http://api.local/static/version/version1234/docs/img/test.png)

## Image absolute

This is an example:

![absolute path image](https://absolute-url-example)

`)

	generator := version.NewHTTPStaticDocGenerator(cfg, logger)
	err = generator.Generate(versionName, docFolder)
	require.Nil(t, err)

	generatedReadme, err := ioutil.ReadFile(path.Join(cfg.Admin.StoragePath, "version/version1234/docs/README.md"))
	if err != nil {
		t.Fatal(err)
	}
	require.Equal(t, string(expectedReadmeContent), string(generatedReadme))
}

func TestHTTPStaticDocGenerator_GenerateWithNoContent(t *testing.T) {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	mocks.AddLoggerExpects(logger)
	cfg := &config.Config{}

	versionName := "version1234"

	generator := version.NewHTTPStaticDocGenerator(cfg, logger)
	err := generator.Generate(versionName, "not-exists-folder")
	require.NotNil(t, err)
}
