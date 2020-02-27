package usecase

import (
	"fmt"
	"os"

	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/krt"
)

func (i *VersionInteractor) storeContent(runtime *entity.Runtime, krtYml *krt.Krt, tmpDir string) error {
	storage, err := i.createStorage(i.logger, runtime)
	if err != nil {
		return err
	}

	bucketName := krtYml.Version
	err = storage.CreateBucket(bucketName)
	if err != nil {
		return err
	}

	i.logger.Infof("Bucket Created for Version %s", krtYml.Version)

	err = storage.CopyDir(tmpDir, bucketName)
	if err != nil {
		return fmt.Errorf("error Copying dir %s: %w", tmpDir, err)
	}

	i.logger.Infof("Dir %s Copied ", tmpDir)

	// Remove KRT file and tmpDir
	err = os.RemoveAll(tmpDir)
	if err != nil {
		i.logger.Errorf("error Removing dir %s", tmpDir)
		return fmt.Errorf("error Removing dir %s: %w", tmpDir, err)
	}

	i.logger.Infof("Dir %s Removed ", tmpDir)

	return nil
}
