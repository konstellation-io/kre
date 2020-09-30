package usecase

import (
	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/mocks"
	"github.com/stretchr/testify/require"
	"testing"
)

type userActivitySuite struct {
	ctrl                   *gomock.Controller
	userActivityInteractor *UserActivityInteractor
	mocks                  userActivitySuiteMocks
}

type userActivitySuiteMocks struct {
	logger           *mocks.MockLogger
	userActivityRepo *mocks.MockUserActivityRepo
}

func newUserActivitySuite(t *testing.T) *userActivitySuite {
	ctrl := gomock.NewController(t)
	logger := mocks.NewMockLogger(ctrl)
	userRepo := mocks.NewMockUserRepo(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)
	accessControl := mocks.NewMockAccessControl(ctrl)
	mocks.AddLoggerExpects(logger)

	userActivityInteractor := NewUserActivityInteractor(
		logger,
		userActivityRepo,
		userRepo,
		accessControl,
	)

	return &userActivitySuite{
		ctrl:                   ctrl,
		userActivityInteractor: userActivityInteractor,
		mocks: userActivitySuiteMocks{
			logger,
			userActivityRepo,
		},
	}
}

func TestRegisterGenerateApiToken(t *testing.T) {
	s := newUserActivitySuite(t)
	defer s.ctrl.Finish()

	userID := "user1"
	name := "test"

	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).DoAndReturn(func(activity entity.UserActivity) error {
		require.Equal(t, entity.UserActivityTypeGenerateApiToken, activity.Type)
		require.Equal(t, userID, activity.UserID)
		return nil
	})

	err := s.userActivityInteractor.RegisterGenerateApiToken(userID, name)
	require.NoError(t, err)

}

func TestRegisterDeleteApiToken(t *testing.T) {
	s := newUserActivitySuite(t)
	defer s.ctrl.Finish()

	userID := "user1"
	name := "test"

	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).DoAndReturn(func(activity entity.UserActivity) error {
		require.Equal(t, entity.UserActivityTypeDeleteApiToken, activity.Type)
		require.Equal(t, userID, activity.UserID)
		return nil
	})

	err := s.userActivityInteractor.RegisterDeleteApiToken(userID, name)
	require.NoError(t, err)

}
