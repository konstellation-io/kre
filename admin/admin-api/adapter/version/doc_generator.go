package version

import (
	"fmt"
	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
	"io"
	"io/ioutil"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"regexp"
)

type HTTPStaticDocGenerator struct {
	cfg    *config.Config
	logger logging.Logger
}

var (
	imgRegExp       = regexp.MustCompile(`!\[(.+)]\(\./(.+)\)`)
	mdFileExtRegExp = regexp.MustCompile("\\.md$")
)

func NewHTTPStaticDocGenerator(cfg *config.Config, logger logging.Logger) *HTTPStaticDocGenerator {
	return &HTTPStaticDocGenerator{
		cfg,
		logger,
	}
}

// Generate takes the documents & images from the docFolder and copies it to
// the static web folder changing the relatives image URLs.
func (g *HTTPStaticDocGenerator) Generate(versionID, docFolder string) error {
	versionDocSubfolder := path.Join("version", versionID, "doc")

	err := g.processMarkdownFiles(docFolder, versionDocSubfolder)
	if err != nil {
		return err
	}

	destDocFolder := path.Join(g.cfg.Admin.StoragePath, versionDocSubfolder)

	g.logger.Infof("[HTTPStaticDocGenerator] Generating doc folder at: %s", destDocFolder)
	err = copyDir(docFolder, destDocFolder)
	if err != nil {
		return fmt.Errorf("error copying doc folder: %w", err)
	}

	return nil
}

func (g *HTTPStaticDocGenerator) processMarkdownFiles(docFolder, versionSubfolder string) error {
	err := filepath.Walk(docFolder, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			fmt.Printf("prevent panic by handling failure accessing a path %q: %v\n", path, err)
			return err
		}

		g.logger.Debugf("[HTTPStaticDocGenerator] Processing file: %s", info.Name())

		if info.IsDir() && !mdFileExtRegExp.MatchString(info.Name()) {
			return nil
		}

		fileContent, err := ioutil.ReadFile(path)

		if imgRegExp.Match(fileContent) {
			g.logger.Debugf("[HTTPStaticDocGenerator] Found relative images into the file %s", info.Name())
			newFileContent, err := g.replaceRelativeImgs(fileContent, versionSubfolder)
			if err != nil {
				return fmt.Errorf("error replacing relative images in doc files: %w", err)
			}

			err = ioutil.WriteFile(path, newFileContent, os.ModePerm)
			if err != nil {
				return fmt.Errorf("error writting doc file: %w", err)
			}
		}

		return nil
	})
	if err != nil {
		return err
	}

	return nil
}

func (g *HTTPStaticDocGenerator) replaceRelativeImgs(file []byte, versionSubfolder string) ([]byte, error) {
	u, err := url.Parse(g.cfg.Admin.BaseURL)
	if err != nil {
		return nil, err
	}

	u.Path = path.Join(u.Path, "static", versionSubfolder)
	replacement := fmt.Sprintf("![$1](%s/$2)", u.String())

	return imgRegExp.ReplaceAll(file, []byte(replacement)), nil
}

// CopyFile copies the contents of the file named src to the file named
// by dst. The file will be created if it does not already exist. If the
// destination file exists, all it's contents will be replaced by the contents
// of the source file. The file mode will be copied from the source and
// the copied data is synced/flushed to stable storage.
func copyFile(src, dst string) (err error) {
	in, err := os.Open(src)
	if err != nil {
		return
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return
	}
	defer func() {
		if e := out.Close(); e != nil {
			err = e
		}
	}()

	_, err = io.Copy(out, in)
	if err != nil {
		return
	}

	err = out.Sync()
	if err != nil {
		return
	}

	si, err := os.Stat(src)
	if err != nil {
		return
	}
	err = os.Chmod(dst, si.Mode())
	if err != nil {
		return
	}

	return
}

// CopyDir recursively copies a directory tree, attempting to preserve permissions.
// Source directory must exist, destination directory must *not* exist.
// Symlinks are ignored and skipped.
func copyDir(src string, dst string) (err error) {
	src = filepath.Clean(src)
	dst = filepath.Clean(dst)

	si, err := os.Stat(src)
	if err != nil {
		return err
	}
	if !si.IsDir() {
		return fmt.Errorf("source is not a directory")
	}

	_, err = os.Stat(dst)
	if err != nil && !os.IsNotExist(err) {
		return
	}
	if err == nil {
		return fmt.Errorf("destination already exists")
	}

	err = os.MkdirAll(dst, si.Mode())
	if err != nil {
		return
	}

	entries, err := ioutil.ReadDir(src)
	if err != nil {
		return
	}

	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())

		if entry.IsDir() {
			err = copyDir(srcPath, dstPath)
			if err != nil {
				return
			}
		} else {
			// Skip symlinks.
			if entry.Mode()&os.ModeSymlink != 0 {
				continue
			}

			err = copyFile(srcPath, dstPath)
			if err != nil {
				return
			}
		}
	}

	return
}
