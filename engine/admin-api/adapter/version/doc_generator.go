package version

import (
	"fmt"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"regexp"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
	"github.com/otiai10/copy"
)

type HTTPStaticDocGenerator struct {
	cfg    *config.Config
	logger logging.Logger
}

var (
	imgRegExp       = regexp.MustCompile(`!\[(.+)]\(\./(.+)\)`)
	mdFileExtRegExp = regexp.MustCompile(`\\.md$`)
)

func NewHTTPStaticDocGenerator(cfg *config.Config, logger logging.Logger) *HTTPStaticDocGenerator {
	return &HTTPStaticDocGenerator{
		cfg,
		logger,
	}
}

// Generate takes the documents & images from the docFolder and copies it to
// the static web folder changing the relatives image URLs.
func (g *HTTPStaticDocGenerator) Generate(versionName, docFolder string) error {
	versionDocSubfolder := path.Join("version", versionName, "docs")

	err := g.processMarkdownFiles(docFolder, versionDocSubfolder)
	if err != nil {
		return err
	}

	destDocFolder := path.Join(g.cfg.Admin.StoragePath, versionDocSubfolder)

	g.logger.Infof("[HTTPStaticDocGenerator] Generating doc folder at: %s", destDocFolder)
	err = copy.Copy(docFolder, destDocFolder)

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

		fileContent, _ := os.ReadFile(path)

		if imgRegExp.Match(fileContent) {
			g.logger.Debugf("[HTTPStaticDocGenerator] Found relative images into the file %s", info.Name())

			newFileContent, err := g.replaceRelativeImgs(fileContent, versionSubfolder)
			if err != nil {
				return fmt.Errorf("error replacing relative images in doc files: %w", err)
			}

			err = os.WriteFile(path, newFileContent, os.ModePerm)
			if err != nil {
				return fmt.Errorf("error writing doc file: %w", err)
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
