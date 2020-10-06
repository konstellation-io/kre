package usecase_test

import (
	"context"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/admin/admin-api/mocks"
)

type userSuite struct {
	ctrl       *gomock.Controller
	interactor *usecase.UserInteractor
	mocks      userSuiteMocks
}

type userSuiteMocks struct {
	logger           *mocks.MockLogger
	userRepo         *mocks.MockUserRepo
	apiTokenRepo     *mocks.MockAPITokenRepo
	userActivityRepo *mocks.MockUserActivityRepo
	accessControl    *mocks.MockAccessControl
}

func newUserSuite(t *testing.T) *userSuite {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	userRepo := mocks.NewMockUserRepo(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)
	sessionRepo := mocks.NewMockSessionRepo(ctrl)
	apiTokenRepo := mocks.NewMockAPITokenRepo(ctrl)
	settingRepo := mocks.NewMockSettingRepo(ctrl)
	accessControl := mocks.NewMockAccessControl(ctrl)
	mocks.AddLoggerExpects(logger)

	cfg := &config.Config{}
	cfg.Auth.APITokenSecret = "someSuperSecretValue"

	userActivityInteractor := usecase.NewUserActivityInteractor(logger, userActivityRepo, userRepo, accessControl)
	loginLinkTransport := mocks.NewMockLoginLinkTransport(ctrl)
	verificationCodeGenerator := mocks.NewMockVerificationCodeGenerator(ctrl)
	verificationCodeRepo := mocks.NewMockVerificationCodeRepo(ctrl)
	authInteractor := usecase.NewAuthInteractor(
		cfg,
		logger,
		loginLinkTransport,
		verificationCodeGenerator,
		verificationCodeRepo,
		userRepo,
		settingRepo,
		userActivityInteractor,
		sessionRepo,
		apiTokenRepo,
		accessControl,
	)
	userInteractor := usecase.NewUserInteractor(
		logger,
		userRepo,
		userActivityInteractor,
		sessionRepo,
		apiTokenRepo,
		accessControl,
		authInteractor,
	)

	return &userSuite{
		ctrl:       ctrl,
		interactor: userInteractor,
		mocks: userSuiteMocks{
			logger,
			userRepo,
			apiTokenRepo,
			userActivityRepo,
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

func TestUserGenerateAPIToken(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	userID := "user1234"
	name := "tokenName"
	code := "abc1234"
	apiToken := entity.APIToken{
		Name:   name,
		UserID: userID,
	}

	s.mocks.apiTokenRepo.EXPECT().GenerateCode(userID).Return(code, nil)
	s.mocks.apiTokenRepo.EXPECT().Create(ctx, apiToken, code).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).DoAndReturn(func(activity entity.UserActivity) error {
		require.Equal(t, entity.UserActivityTypeGenerateAPIToken, activity.Type)
		require.Equal(t, userID, activity.UserID)
		return nil
	})

	res, err := s.interactor.GenerateAPIToken(ctx, name, userID)
	require.NoError(t, err)
	require.Equal(t, code, res)
}

func TestDeleteAPIToken(t *testing.T) {
	s := newUserSuite(t)
	defer s.ctrl.Finish()

	inputAPIToken := &entity.APIToken{
		ID:   "token1",
		Name: "test",
		Hash: "abcdefg",
	}

	ctx := context.Background()
	userID := "user1234"

	s.mocks.apiTokenRepo.EXPECT().GetByID(ctx, inputAPIToken.ID).Return(inputAPIToken, nil)
	s.mocks.apiTokenRepo.EXPECT().DeleteById(ctx, inputAPIToken.ID).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).DoAndReturn(func(activity entity.UserActivity) error {
		require.Equal(t, entity.UserActivityTypeDeleteAPIToken, activity.Type)
		require.Equal(t, userID, activity.UserID)
		return nil
	})

	apiToken, err := s.interactor.DeleteAPIToken(ctx, inputAPIToken.ID, userID)
	require.NoError(t, err)
	require.EqualValues(t, inputAPIToken, apiToken)
}
