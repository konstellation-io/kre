package usecase_test

import (
	"context"
	"testing"

	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/auth"

	"github.com/golang/mock/gomock"

	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/mocks"
)

type userSuite struct {
	ctrl       *gomock.Controller
	interactor *usecase.UserInteractor
	mocks      userSuiteMocks
}

type userSuiteMocks struct {
	logger        *mocks.MockLogger
	userRepo      *mocks.MockUserRepo
	accessControl *mocks.MockAccessControl
}

func newUserSuite(t *testing.T) *userSuite {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	userRepo := mocks.NewMockUserRepo(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)
	sessionRepo := mocks.NewMockSessionRepo(ctrl)
	accessControl := mocks.NewMockAccessControl(ctrl)

	mocks.AddLoggerExpects(logger)

	userActivityInteractor := usecase.NewUserActivityInteractor(logger, userActivityRepo, userRepo, accessControl)

	userInteractor := usecase.NewUserInteractor(
		logger,
		userRepo,
		userActivityInteractor,
		sessionRepo,
		accessControl,
	)

	return &userSuite{
		ctrl:       ctrl,
		interactor: userInteractor,
		mocks: userSuiteMocks{
			logger,
			userRepo,
			accessControl,
		},
	}
}

func TestUserGetByID(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	userID := "user1"

	userFound := &entity.User{
		ID:    userID,
		Email: "test@test.com",
	}

	s.mocks.userRepo.EXPECT().GetByID(userID).Return(userFound, nil)

	res, err := s.interactor.GetByID(userID)
	require.Nil(t, err)
	require.EqualValues(t, res, userFound)
}

func TestGetAllUsers(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	usersFound := []*entity.User{
		{
			ID:    "user1",
			Email: "test@test.com",
		},
	}

	ctx := context.Background()
	userID := "user1234"

	s.mocks.accessControl.EXPECT().CheckPermission(userID, auth.ResUsers, auth.ActView)
	s.mocks.userRepo.EXPECT().GetAll(ctx, false).Return(usersFound, nil)

	res, err := s.interactor.GetAllUsers(ctx, userID, false)
	require.Nil(t, err)
	require.EqualValues(t, res, usersFound)
}
