package usecase

import (
	"fmt"

	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
)

func checkUserActivityError(logger logging.Logger, err error) error {
	if err != nil {
		logger.Error("error creating userActivity")
		return fmt.Errorf("error creating userActivity: %w", err)
	}
	return nil
}

func (i *VersionInteractor) registerCreateAction(userID string, runtime *entity.Runtime, version *entity.Version) error {
	err := i.userActivityInteractor.Create(
		userID,
		UserActivityTypeCreateVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtime.ID},
			{Key: "RUNTIME_NAME", Value: runtime.Name},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *VersionInteractor) registerStartAction(userID string, runtime *entity.Runtime, version *entity.Version) error {
	err := i.userActivityInteractor.Create(
		userID,
		UserActivityTypeStartVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtime.ID},
			{Key: "RUNTIME_NAME", Value: runtime.Name},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
		})

	return checkUserActivityError(i.logger, err)
}

func (i *VersionInteractor) registerStopAction(userID string, runtime *entity.Runtime, version *entity.Version) error {
	err := i.userActivityInteractor.Create(
		userID,
		UserActivityTypeStopVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtime.ID},
			{Key: "RUNTIME_NAME", Value: runtime.Name},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
		})
	return checkUserActivityError(i.logger, err)
}

func (i *VersionInteractor) registerPublishAction(userID string, runtime *entity.Runtime, version *entity.Version, prev *entity.Version, comment string) error {
	err := i.userActivityInteractor.Create(
		userID,
		UserActivityTypePublishVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtime.ID},
			{Key: "RUNTIME_NAME", Value: runtime.Name},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
			{Key: "OLD_PUBLISHED_VERSION_ID", Value: prev.ID},
			{Key: "OLD_PUBLISHED_VERSION_NAME", Value: prev.Name},
			{Key: "COMMENT", Value: comment},
		})
	return checkUserActivityError(i.logger, err)
}

func (i *VersionInteractor) registerUnpublishAction(userID string, runtime *entity.Runtime, version *entity.Version) error {
	err := i.userActivityInteractor.Create(
		userID,
		UserActivityTypeUnpublishVersion,
		[]*entity.UserActivityVar{
			{Key: "RUNTIME_ID", Value: runtime.ID},
			{Key: "RUNTIME_NAME", Value: runtime.Name},
			{Key: "VERSION_ID", Value: version.ID},
			{Key: "VERSION_NAME", Value: version.Name},
		})
	return checkUserActivityError(i.logger, err)
}
