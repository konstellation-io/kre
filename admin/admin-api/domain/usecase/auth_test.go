package usecase_test

import (
	"context"
	"errors"
	"fmt"
	"github.com/dgryski/trifles/uuid"
	authAdapter "github.com/konstellation-io/kre/admin/admin-api/adapter/auth"
	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/auth"
	"testing"
	"time"

	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase"

	"github.com/golang/mock/gomock"

	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin/admin-api/mocks"
)

type authSuite struct {
	ctrl           *gomock.Controller
	authInteractor usecase.AuthInteracter
	tokenManager   auth.TokenManager
	mocks          authSuiteMocks
}

type authSuiteMocks struct {
	cfg                       *config.Config
	logger                    *mocks.MockLogger
	loginLinkTransport        *mocks.MockLoginLinkTransport
	verificationCodeGenerator *mocks.MockVerificationCodeGenerator
	verificationCodeRepo      *mocks.MockVerificationCodeRepo
	userRepo                  *mocks.MockUserRepo
	settingRepo               *mocks.MockSettingRepo
	userActivityRepo          *mocks.MockUserActivityRepo
	accessControl             *mocks.MockAccessControl
}

func newAuthSuite(t *testing.T) *authSuite {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	loginLinkTransport := mocks.NewMockLoginLinkTransport(ctrl)
	verificationCodeGenerator := mocks.NewMockVerificationCodeGenerator(ctrl)
	verificationCodeRepo := mocks.NewMockVerificationCodeRepo(ctrl)
	userRepo := mocks.NewMockUserRepo(ctrl)
	settingRepo := mocks.NewMockSettingRepo(ctrl)
	sessionRepo := mocks.NewMockSessionRepo(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)
	accessControl := mocks.NewMockAccessControl(ctrl)

	mocks.AddLoggerExpects(logger)

	userActivityInteractor := usecase.NewUserActivityInteractor(
		logger,
		userActivityRepo,
		userRepo,
		accessControl,
	)

	cfg := &config.Config{}
	cfg.Auth.APIToken.CipherSecret = "someSuperSecretValue"
	tokenManager := authAdapter.NewTokenManager(cfg, logger)

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
		accessControl,
		tokenManager,
	)

	return &authSuite{
		ctrl:         ctrl,
		tokenManager: tokenManager,
		mocks: authSuiteMocks{
			cfg,
			logger,
			loginLinkTransport,
			verificationCodeGenerator,
			verificationCodeRepo,
			userRepo,
			settingRepo,
			userActivityRepo,
			accessControl,
		},
		authInteractor: authInteractor,
	}
}

func TestSignInWithValidUser(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	verificationCode := "test_verification_code"
	verificationCodeDurationInMinutes := 1
	user := &entity.User{
		Email: "userA@testdomain.com",
		ID:    "userA",
	}

	s.mocks.userRepo.EXPECT().GetByEmail(user.Email).Return(user, nil)
	s.mocks.verificationCodeGenerator.EXPECT().Generate().Return(verificationCode)
	s.mocks.verificationCodeRepo.EXPECT().Store(verificationCode, user.ID, gomock.Any()).Return(nil)
	s.mocks.loginLinkTransport.EXPECT().Send(user.Email, verificationCode).Return(nil)

	err := s.authInteractor.SignIn(context.Background(), user.Email, verificationCodeDurationInMinutes)
	require.Nil(t, err)
}

func TestSignUpWithValidEmailAddress(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	verificationCode := "test_verification_code"
	verificationCodeDurationInMinutes := 1
	userId := "userA"
	domain := "testdomain.com"
	email := fmt.Sprintf("%s@%s", userId, domain)

	user := &entity.User{
		Email: email,
		ID:    userId,
	}
	settings := &entity.Settings{
		SessionLifetimeInDays: 0,
		AuthAllowedDomains:    []string{"testdomain.com"},
	}

	ctx := context.Background()

	s.mocks.userRepo.EXPECT().GetByEmail(user.Email).Return(nil, usecase.ErrUserNotFound)
	s.mocks.settingRepo.EXPECT().Get(ctx).Return(settings, nil)
	s.mocks.verificationCodeGenerator.EXPECT().Generate().Return(verificationCode)
	s.mocks.verificationCodeRepo.EXPECT().Store(verificationCode, user.ID, gomock.Any()).Return(nil)
	s.mocks.loginLinkTransport.EXPECT().Send(user.Email, verificationCode).Return(nil)
	s.mocks.userRepo.EXPECT().Create(gomock.Any(), user.Email, gomock.Any()).Return(user, nil)
	s.mocks.accessControl.EXPECT().ReloadUserRoles().Return(nil)

	err := s.authInteractor.SignIn(ctx, user.Email, verificationCodeDurationInMinutes)
	require.Nil(t, err)
}

func TestSignUpWithInvalidDomain(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	verificationCodeDurationInMinutes := 1
	user := &entity.User{
		Email: "userA@testdomain.com",
		ID:    "userA",
	}
	settings := &entity.Settings{
		SessionLifetimeInDays: 0,
		AuthAllowedDomains:    []string{"anotherdomain.com"},
	}

	ctx := context.Background()
	s.mocks.userRepo.EXPECT().GetByEmail(user.Email).Return(nil, usecase.ErrUserNotFound)
	s.mocks.settingRepo.EXPECT().Get(ctx).Return(settings, nil)

	err := s.authInteractor.SignIn(ctx, user.Email, verificationCodeDurationInMinutes)
	require.Equal(t, usecase.ErrUserNotAllowed, err)
}

func TestSignUpWithValidDomain(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	verificationCode := "test_verification_code"
	verificationCodeDurationInMinutes := 1
	domain := "testdomain.com"
	user := &entity.User{
		Email: "userA@" + domain,
		ID:    "userA",
	}
	settings := &entity.Settings{
		SessionLifetimeInDays: 0,
		AuthAllowedDomains:    []string{domain},
	}

	ctx := context.Background()

	s.mocks.userRepo.EXPECT().GetByEmail(user.Email).Return(nil, usecase.ErrUserNotFound)
	s.mocks.settingRepo.EXPECT().Get(ctx).Return(settings, nil)
	s.mocks.verificationCodeGenerator.EXPECT().Generate().Return(verificationCode)
	s.mocks.verificationCodeRepo.EXPECT().Store(verificationCode, user.ID, gomock.Any()).Return(nil)
	s.mocks.loginLinkTransport.EXPECT().Send(user.Email, verificationCode).Return(nil)
	s.mocks.userRepo.EXPECT().Create(gomock.Any(), user.Email, gomock.Any()).Return(user, nil)
	s.mocks.accessControl.EXPECT().ReloadUserRoles().Return(nil)

	err := s.authInteractor.SignIn(ctx, user.Email, verificationCodeDurationInMinutes)
	require.Nil(t, err)
}

func TestSignInErrGettingUser(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	email := "userA@testdomain.com"
	unexpectedErr := errors.New("unexpected error")

	ctx := context.Background()

	s.mocks.userRepo.EXPECT().GetByEmail(email).Return(nil, unexpectedErr)

	err := s.authInteractor.SignIn(ctx, email, 1)
	require.Equal(t, unexpectedErr, err)
}

func TestSignUpErrGettingSettings(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	unexpectedErr := errors.New("unexpected error")
	verificationCodeDurationInMinutes := 1
	user := &entity.User{
		Email: "userA@testdomain.com",
		ID:    "userA",
	}

	ctx := context.Background()

	s.mocks.userRepo.EXPECT().GetByEmail(user.Email).Return(nil, usecase.ErrUserNotFound)
	s.mocks.settingRepo.EXPECT().Get(ctx).Return(&entity.Settings{}, unexpectedErr)

	err := s.authInteractor.SignIn(ctx, user.Email, verificationCodeDurationInMinutes)
	require.Equal(t, unexpectedErr, err)
}

func TestSignInErrInvalidEmail(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	email := "invalidemailaddress"

	err := s.authInteractor.SignIn(context.Background(), email, 1)
	require.Equal(t, usecase.ErrUserEmailInvalid, err)
}

func TestSignInErrStoringValidationCode(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	unexpectedErr := errors.New("unexpected error")
	verificationCode := "test_verification_code"
	verificationCodeDurationInMinutes := 1
	user := &entity.User{
		Email: "userA@testdomain.com",
		ID:    "userA",
	}

	s.mocks.userRepo.EXPECT().GetByEmail(user.Email).Return(user, nil)
	s.mocks.verificationCodeGenerator.EXPECT().Generate().Return(verificationCode)
	s.mocks.verificationCodeRepo.EXPECT().Store(verificationCode, user.ID, gomock.Any()).Return(unexpectedErr)

	err := s.authInteractor.SignIn(context.Background(), user.Email, verificationCodeDurationInMinutes)
	require.Equal(t, unexpectedErr, err)
}

func TestSignUpErrCreatingUser(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	unexpectedErr := errors.New("unexpected error")
	verificationCodeDurationInMinutes := 1
	domain := "testdomain.com"
	user := &entity.User{
		Email: "userA@" + domain,
		ID:    "userA",
	}
	settings := &entity.Settings{
		SessionLifetimeInDays: 0,
		AuthAllowedDomains:    []string{domain},
	}

	s.mocks.userRepo.EXPECT().GetByEmail(user.Email).Return(nil, usecase.ErrUserNotFound)
	s.mocks.settingRepo.EXPECT().Get(ctx).Return(settings, nil)
	s.mocks.userRepo.EXPECT().Create(gomock.Any(), user.Email, gomock.Any()).Return(nil, unexpectedErr)

	err := s.authInteractor.SignIn(ctx, user.Email, verificationCodeDurationInMinutes)
	require.Equal(t, unexpectedErr, err)
}

func TestVerifyCode(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	code := "test_verification_code"
	verificationCode := &entity.VerificationCode{
		Code:      code,
		UID:       "userA",
		ExpiresAt: time.Now().Add(time.Duration(1) * time.Minute),
	}

	s.mocks.verificationCodeRepo.EXPECT().Get(code).Return(verificationCode, nil)
	s.mocks.verificationCodeRepo.EXPECT().Delete(code).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).Return(nil)

	userId, err := s.authInteractor.VerifyCode(code)
	require.Nil(t, err)
	require.Equal(t, verificationCode.UID, userId)
}

func TestVerifyNotFoundCode(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	code := "test_verification_code"
	s.mocks.verificationCodeRepo.EXPECT().Get(code).Return(nil, usecase.ErrVerificationCodeNotFound)

	_, err := s.authInteractor.VerifyCode(code)
	require.Equal(t, usecase.ErrVerificationCodeNotFound, err)
}

func TestVerifyExpiredCode(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	code := "test_verification_code"
	verificationCode := &entity.VerificationCode{
		Code:      code,
		UID:       "userA",
		ExpiresAt: time.Now().Add(time.Duration(-1) * time.Minute),
	}

	s.mocks.verificationCodeRepo.EXPECT().Get(code).Return(verificationCode, nil)
	s.mocks.verificationCodeRepo.EXPECT().Delete(code).Return(nil)

	_, err := s.authInteractor.VerifyCode(code)
	require.Equal(t, usecase.ErrExpiredVerificationCode, err)
}

func TestVerifyCodeErrCreatingUserActivity(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	unexpectedErr := errors.New("unexpected error")
	code := "test_verification_code"
	verificationCode := &entity.VerificationCode{
		Code:      code,
		UID:       "userA",
		ExpiresAt: time.Now().Add(time.Duration(1) * time.Minute),
	}

	s.mocks.verificationCodeRepo.EXPECT().Get(code).Return(verificationCode, nil)
	s.mocks.verificationCodeRepo.EXPECT().Delete(code).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).Return(unexpectedErr)

	_, err := s.authInteractor.VerifyCode(code)
	require.Equal(t, fmt.Errorf("error creating userActivity: %w", unexpectedErr), err)
}

func TestVerifyCodeErrDeletingValidationCode(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	unexpectedErr := errors.New("unexpected error")
	code := "test_verification_code"
	verificationCode := &entity.VerificationCode{
		Code:      code,
		UID:       "userA",
		ExpiresAt: time.Now().Add(time.Duration(1) * time.Minute),
	}

	s.mocks.verificationCodeRepo.EXPECT().Get(code).Return(verificationCode, nil)
	s.mocks.verificationCodeRepo.EXPECT().Delete(code).Return(unexpectedErr)
	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).Return(nil)

	userId, err := s.authInteractor.VerifyCode(code)
	require.NoError(t, err)
	require.Equal(t, verificationCode.UID, userId)
}

func TestCheckAPIToken(t *testing.T) {
	s := newAuthSuite(t)
	defer s.ctrl.Finish()

	userID := "user1"
	key := uuid.UUIDv4()

	internalToken := fmt.Sprintf("%s:%s", userID, key)
	apiToken, _ := s.tokenManager.Encrypt(internalToken)
	ctx := context.Background()
	s.mocks.userRepo.EXPECT().GetAPITokenByValue(ctx, userID, key).Return(&entity.APIToken{}, nil)
	s.mocks.userRepo.EXPECT().UpdateAPITokenLastActivity(gomock.Any(), userID, key).Return(nil)
	s.mocks.userActivityRepo.EXPECT().Create(gomock.Any()).DoAndReturn(func(activity entity.UserActivity) error {
		require.Equal(t, entity.UserActivityTypeLogin, activity.Type)
		require.Equal(t, userID, activity.UserID)
		return nil
	})

	actualUserID, err := s.authInteractor.CheckAPIToken(ctx, apiToken)
	require.NoError(t, err)
	require.Equal(t, userID, actualUserID)
}
