package validator_test

import (
	"bytes"
	"io/ioutil"
	"os"
	"path"
	"strings"
	"testing"

	"github.com/MakeNowJust/heredoc"
	"github.com/konstellation-io/kre/libs/simplelogger"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/libs/krt-utils/pkg/krt"
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

	sampleKrtObject = &krt.File{
		Version:     "test-v1",
		Description: "Version for testing.",
		Entrypoint: krt.Entrypoint{
			Proto: "public_input.proto",
			Image: "konstellation/kre-entrypoint:latest",
		},
		Config: krt.Config{
			Variables: []string{
				"SOME_CONFIG_VAR",
			},
			Files: []string{
				"SOME_FILE",
			},
		},
		Nodes: []krt.Node{
			{
				Name:  "py-test",
				Image: "konstellation/kre-py:latest",
				Src:   "src/py-test/main.py",
				GPU:   true,
			},
		},
		Workflows: []krt.Workflow{
			{
				Name:       "py-test",
				Entrypoint: "PyTest",
				Sequential: []string{"py-test"},
			},
		},
	}
)

func TestNewWithLogger(t *testing.T) {
	l := simplelogger.New(simplelogger.LevelDebug)
	v := validator.NewWithLogger(l)

	r := bytes.NewBufferString(sampleKrtString)

	k, err := v.Parse(r)
	require.NoError(t, err)

	errs := v.Validate(k)
	require.NoError(t, errs)
}

func TestNewWithLoggerWriter(t *testing.T) {
	out := bytes.NewBufferString("")
	l := simplelogger.NewWithWriter(simplelogger.LevelDebug, out)
	v := validator.NewWithLogger(l)

	r := bytes.NewBufferString(sampleKrtString)

	k, err := v.Parse(r)
	require.NoError(t, err)

	errs := v.Validate(k)
	require.NoError(t, errs)

	expectedOut := out.String()
	require.Contains(t, expectedOut, "INFO Validating KRT file")
	require.Contains(t, expectedOut, "INFO Validating KRT workflows")
	require.Contains(t, expectedOut, "INFO Validating KRT image names")
}

func TestValidator_ParseFile(t *testing.T) {
	configDir := setupConfigDir(t)
	defer cleanConfigDir(t, configDir)

	file := path.Join(configDir, "krt.yaml")
	createTestKrtYaml(t, file, sampleKrtString)

	v := validator.New()

	actualKrt, err := v.ParseFile(file)
	require.NoError(t, err)

	require.Equal(t, sampleKrtObject, actualKrt)
}

func TestValidator_ParseFileInvalid(t *testing.T) {
	v := validator.New()

	k, err := v.ParseFile("/tmp/unknown-krt-file")
	require.Nil(t, k)
	require.EqualError(t, err, "error reading file /tmp/unknown-krt-file: open /tmp/unknown-krt-file: no such file or directory")

}
func TestValidator_Parse(t *testing.T) {
	v := validator.New()

	r := bytes.NewBufferString(sampleKrtString)

	actualKrt, err := v.Parse(r)
	require.NoError(t, err)

	require.Equal(t, sampleKrtObject, actualKrt)
}

func TestValidator_Validate(t *testing.T) {
	v := validator.New()

	r := bytes.NewBufferString(sampleKrtString)

	k, err := v.Parse(r)
	require.NoError(t, err)

	errs := v.Validate(k)
	require.NoError(t, errs)
}

func TestValidator_ValidateContent(t *testing.T) {
	tmpDir := setupConfigDir(t)
	defer cleanConfigDir(t, tmpDir)

	file := path.Join(tmpDir, "krt.yaml")
	createTestKrtYaml(t, file, sampleKrtString)

	createTestKrtContent(t, tmpDir, "src/py-test/main.py")

	v := validator.New()

	k, err := v.ParseFile(file)
	require.NoError(t, err)

	errs := v.Validate(k)
	require.NoError(t, errs)

	errs = v.ValidateContent(k, tmpDir)
	require.NoError(t, errs)
}

func TestValidator_ValidateContentMissing(t *testing.T) {
	v := validator.New()

	k, err := v.Parse(bytes.NewBufferString(sampleKrtString))
	require.NoError(t, err)

	errs := v.Validate(k)
	require.NoError(t, errs)

	errs = v.ValidateContent(k, "/tmp/krt-random-dir")
	valErrs := errs.(validator.ValidationErrors)
	require.Len(t, valErrs, 1)
	require.EqualError(t, valErrs[0], "error src File src/py-test/main.py for node py-test not exists")
}

func TestValidator_ValidateInvalidYaml(t *testing.T) {
	v := validator.New()

	r := bytes.NewBufferString(heredoc.Doc(`
     some:
         wrong:
       - test
	`))

	k, err := v.Parse(r)
	require.Nil(t, k)
	require.EqualError(t, err, "error Unmarshal yaml file: yaml: line 2: did not find expected key")
}

func TestValidator_ValidateInvalidVersion(t *testing.T) {
	v := validator.New()

	s := strings.ReplaceAll(sampleKrtString, "version: test-v1\n", "")

	r := bytes.NewBufferString(s)

	k, err := v.Parse(r)
	require.NoError(t, err)

	errs := v.Validate(k)
	valErrs := errs.(validator.ValidationErrors)

	require.Len(t, valErrs, 1)
	require.EqualError(t, valErrs[0], "error on KRT struct validation: \nKey: 'File.Version' Error:Field validation for 'Version' failed on the 'required' tag")
}

func TestValidator_ValidateInvalidKrt(t *testing.T) {
	v := validator.New()

	s := strings.ReplaceAll(sampleKrtString, "- py-test", "- unknown-node-name")
	s = strings.ReplaceAll(s, "konstellation/kre-entrypoint:latest", "konstellation/KRE-entrypoint:latest")

	r := bytes.NewBufferString(s)

	k, err := v.Parse(r)
	require.NoError(t, err)

	errs := v.Validate(k)
	valErrs := errs.(validator.ValidationErrors)

	require.Len(t, errs, 2)
	require.EqualError(t, valErrs[0], "error validating KRT workflows: node in sequential not found: unknown-node-name")
	require.EqualError(t, valErrs[1], "error validating KRT images: entrypoint image error: repository name must be lowercase")
}

func createTestKrtYaml(t *testing.T, filename, content string) {
	t.Helper()

	f, err := os.Create(filename)

	defer func() {
		_ = f.Close()
	}()

	require.NoError(t, err)

	_, _ = f.Write([]byte(content))
}

func createTestKrtContent(t *testing.T, rootDir string, files ...string) {
	t.Helper()

	for _, name := range files {
		name = path.Join(rootDir, name)
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

// setupConfigDir setup a testing folder.
func setupConfigDir(t *testing.T) string {
	t.Helper()

	dir, err := ioutil.TempDir("", "krt-utils-test")
	require.NoError(t, err)

	return dir
}

// cleanConfigDir clean temporal testing.
func cleanConfigDir(t *testing.T, dir string) {
	t.Helper()

	err := os.RemoveAll(dir)
	require.NoError(t, err)
}
