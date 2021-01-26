package builder

import (
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"strings"
	"testing"

	"github.com/MakeNowJust/heredoc"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/libs/krt-utils/pkg/validator"
)

var (
	sampleKrtString = heredoc.Doc(`
    version: test-v1
    description: Version for testing.
    entrypoint:
      proto: public_input.proto
      image: konstellation/kre-entrypoint:latest
    config:
      variables:
        - SOME_CONFIG_VAR
      files:
        - SOME_FILE
    nodes:
      - name: py-test
        image: konstellation/kre-py:latest
        src: src/py-test/main.py
        gpu: true
    workflows:
      - name: py-test
        entrypoint: PyTest
        sequential:
          - py-test
	`)
)

func createKrtFile(t *testing.T, root, content, filename string) {
	t.Helper()
	err := ioutil.WriteFile(filepath.Join(root, filename), []byte(content), 0755)
	require.NoError(t, err)
}

func createTestKrtContent(t *testing.T, root string, files ...string) {
	t.Helper()
	for _, name := range files {
		name = path.Join(root, name)
		filePath := path.Dir(name)
		_, err := os.Stat(filePath)
		if os.IsNotExist(err) {
			err = os.MkdirAll(filePath, 0755)
			require.NoError(t, err)
		}
		f, err := os.Create(name)
		defer func() {
			_ = f.Close()
		}()
		require.NoError(t, err)
	}
}

func TestBuilder_Build(t *testing.T) {
	files := []string{
		"src/py-test/main.py",
		"src/py-test/main.pyc",
		"src/go-test/go.go",
		"docs/README.md",
		"metrics/dashboards/models.json",
		"metrics/dashboards/application.json",
	}

	// Create test dir structure
	tmp, err := ioutil.TempDir("", "TestBuilder_Build")
	require.NoError(t, err)
	defer os.RemoveAll(tmp)

	createTestKrtContent(t, tmp, files...)
	createKrtFile(t, tmp, "*.pyc", ".krtignore")
	createKrtFile(t, tmp, sampleKrtString, "krt.yaml")

	b := New()
	err = b.Build(tmp, "test.krt")
	require.NoError(t, err)
	defer os.RemoveAll("test.krt")

	_, err = os.Stat("test.krt")
	require.NoError(t, err)

}

func TestBuilder_skipFile(t *testing.T) {
	type testCases struct {
		File     map[string]bool
		Patterns []string
	}

	cases := []testCases{
		{
			File: map[string]bool{
				"test.WARNING1234235test":     false,
				"test1/test/test.WARNING.log": true,
				"test.WARNING.log":            true,
			},
			Patterns: []string{"**/**.WARN*.*"},
		},
		{
			File: map[string]bool{
				"konstellation-io.go":           true,
				"/foo/bar/konstellation-io.log": true,
			},
			Patterns: []string{"**/konstellation-io*"},
		},
	}

	b := New()
	for _, c := range cases {
		for file, ignore := range c.File {
			match, err := b.skipFile(file, c.Patterns)
			require.NoError(t, err, fmt.Errorf("file %s failed with error: %w", file, err))
			require.Equal(t, ignore, match, fmt.Sprintf("File %s failed test with patterns: %s", file, strings.Join(c.Patterns, ",")))
		}
	}

}

func TestBuilder_UpdateVersion(t *testing.T) {
	tmp, err := ioutil.TempDir("", "TestBuilder_UpdateVersion")
	require.NoError(t, err)
	createKrtFile(t, tmp, sampleKrtString, "krt.yml")

	updateVersion := "test1234"
	b := New()
	err = b.UpdateVersion(tmp, updateVersion)
	require.NoError(t, err)
	_, yaml, err := b.getKrtYaml(tmp)
	require.NoError(t, err)

	v := validator.New()
	krt, err := v.ParseFile(yaml)
	require.NoError(t, err)
	require.Equal(t, krt.Version, updateVersion)
}

func TestBuilder_UpdateVersionErrors(t *testing.T) {
	tmp, err := ioutil.TempDir("", "TestBuilder_UpdateVersionErrors")
	require.NoError(t, err)
	b := New()
	updateVersion := "test1234"
	invalidVersion := "12345TEST"
	defer os.RemoveAll(tmp)
	fmt.Println(tmp)

	// Test wrong  name
	err = b.UpdateVersion(tmp, invalidVersion)
	require.EqualError(t, err, "invalid version name")

	// Test no file found
	err = b.UpdateVersion(tmp, updateVersion)
	require.EqualError(t, err, "error while getting yaml: no yaml file found")

	// Test bad yaml file
	createKrtFile(t, tmp, "descriptio, Version for testing", "krt.yml")
	err = b.UpdateVersion(tmp, updateVersion)
	require.EqualError(t, err, "error")

	// Test bad write
	err = os.Chmod(filepath.Join(tmp, "krt.yml"), 0100)
	require.NoError(t, err)
}
