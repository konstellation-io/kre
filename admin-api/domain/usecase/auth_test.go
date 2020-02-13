package usecase_test

import (
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"

	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/mocks"
)

type AuthSuite struct {
	suite.Suite
	mocks                  AuthSuiteMocks
	authInteractor         *usecase.AuthInteractor
	userActivityInteractor *usecase.UserActivityInteractor
}

type AuthSuiteMocks struct {
	logger                    *mocks.Logger
	loginLinkTransport        *mocks.LoginLinkTransport
	verificationCodeGenerator *mocks.VerificationCodeGenerator
	verificationCodeRepo      *mocks.VerificationCodeRepo
	userRepo                  *mocks.UserRepo
	settingRepo               *mocks.SettingRepo
	userActivityRepo          *mocks.UserActivityRepo
}

func TestAuthSuite(t *testing.T) {
	suite.Run(t, new(AuthSuite))
}

func (s *AuthSuite) SetupTest() {
	s.mocks = AuthSuiteMocks{
		logger:                    new(mocks.Logger),
		loginLinkTransport:        new(mocks.LoginLinkTransport),
		verificationCodeGenerator: new(mocks.VerificationCodeGenerator),
		verificationCodeRepo:      new(mocks.VerificationCodeRepo),
		userRepo:                  new(mocks.UserRepo),
		settingRepo:               new(mocks.SettingRepo),
		userActivityRepo:          new(mocks.UserActivityRepo),
	}

	s.mocks.logger.On("Info", mock.Anything).Return()
	s.mocks.logger.On("Warn", mock.Anything).Return()
	s.mocks.logger.On("Error", mock.Anything).Return()

	s.userActivityInteractor = usecase.NewUserActivityInteractor(
		s.mocks.logger,
		s.mocks.userActivityRepo,
		s.mocks.userRepo,
	)

	s.authInteractor = usecase.NewAuthInteractor(
		s.mocks.logger,
		s.mocks.loginLinkTransport,
		s.mocks.verificationCodeGenerator,
		s.mocks.verificationCodeRepo,
		s.mocks.userRepo,
		s.mocks.settingRepo,
		s.userActivityInteractor,
	)
}

func (s *AuthSuite) TestSignInWithoutDomainValidation() {
	t := s.T()

	verificationCode := "test_verification_code"
	verificationCodeDurationInMinutes := 1
	user := &entity.User{
		Email: "userA@testdomain.com",
		ID:    "userA",
	}
	settings := &entity.Setting{
		SessionLifetimeInDays: 0,
		AuthAllowedDomains:    []string{},
	}

	s.mocks.userRepo.On("GetByEmail", user.Email).Return(user, nil)
	s.mocks.settingRepo.On("Get").Return(settings, nil)
	s.mocks.verificationCodeGenerator.On("Generate").Return(verificationCode)
	s.mocks.verificationCodeRepo.On("Store", verificationCode, user.ID, mock.Anything).Return(nil)
	s.mocks.loginLinkTransport.On("Send", user.Email, verificationCode).Return(nil)

	err := s.authInteractor.SignIn(user.Email, verificationCodeDurationInMinutes)
	require.Nil(t, err)
}

func (s *AuthSuite) TestSignInWithValidDomain() {
	t := s.T()

	verificationCode := "test_verification_code"
	verificationCodeDurationInMinutes := 1
	domain := "testdomain.com"
	user := &entity.User{
		Email: "userA@" + domain,
		ID:    "userA",
	}
	settings := &entity.Setting{
		SessionLifetimeInDays: 0,
		AuthAllowedDomains:    []string{domain},
	}

	s.mocks.userRepo.On("GetByEmail", user.Email).Return(user, nil)
	s.mocks.settingRepo.On("Get").Return(settings, nil)
	s.mocks.verificationCodeGenerator.On("Generate").Return(verificationCode)
	s.mocks.verificationCodeRepo.On("Store", verificationCode, user.ID, mock.Anything).Return(nil)
	s.mocks.loginLinkTransport.On("Send", user.Email, verificationCode).Return(nil)

	err := s.authInteractor.SignIn(user.Email, verificationCodeDurationInMinutes)
	require.Nil(t, err)
}

func (s *AuthSuite) TestSignInWithInvalidDomain() {
	t := s.T()

	verificationCode := "test_verification_code"
	verificationCodeDurationInMinutes := 1
	user := &entity.User{
		Email: "userA@testdomain.com",
		ID:    "userA",
	}
	settings := &entity.Setting{
		SessionLifetimeInDays: 0,
		AuthAllowedDomains:    []string{"anotherdomain.com"},
	}

	s.mocks.userRepo.On("GetByEmail", user.Email).Return(user, nil)
	s.mocks.settingRepo.On("Get").Return(settings, nil)
	s.mocks.verificationCodeGenerator.On("Generate").Return(verificationCode)
	s.mocks.verificationCodeRepo.On("Store", verificationCode, user.ID, mock.Anything).Return(nil)
	s.mocks.loginLinkTransport.On("Send", user.Email, verificationCode).Return(nil)

	err := s.authInteractor.SignIn(user.Email, verificationCodeDurationInMinutes)
	require.Equal(t, usecase.ErrDomainNotAllowed, err)
}

func (s *AuthSuite) TestSignUpWithValidDomain() {
	t := s.T()

	verificationCode := "test_verification_code"
	verificationCodeDurationInMinutes := 1
	domain := "testdomain.com"
	user := &entity.User{
		Email: "userA@" + domain,
		ID:    "userA",
	}
	settings := &entity.Setting{
		SessionLifetimeInDays: 0,
		AuthAllowedDomains:    []string{domain},
	}

	s.mocks.userRepo.On("GetByEmail", user.Email).Return(nil, usecase.ErrUserNotFound)
	s.mocks.settingRepo.On("Get").Return(settings, nil)
	s.mocks.verificationCodeGenerator.On("Generate").Return(verificationCode)
	s.mocks.verificationCodeRepo.On("Store", verificationCode, user.ID, mock.Anything).Return(nil)
	s.mocks.loginLinkTransport.On("Send", user.Email, verificationCode).Return(nil)
	s.mocks.userRepo.On("Create", user.Email).Return(user, nil)

	err := s.authInteractor.SignIn(user.Email, verificationCodeDurationInMinutes)
	require.Nil(t, err)
}

func (s *AuthSuite) TestSignInErrGettingUser() {
	t := s.T()

	email := "userA@testdomain.com"
	unexpectedErr := errors.New("unexpected error")

	s.mocks.userRepo.On("GetByEmail", email).Return(nil, unexpectedErr)

	err := s.authInteractor.SignIn(email, 1)
	require.Equal(t, unexpectedErr, err)
}

func (s *AuthSuite) TestSignInErrGettingSettings() {
	t := s.T()

	unexpectedErr := errors.New("unexpected error")
	verificationCodeDurationInMinutes := 1
	user := &entity.User{
		Email: "userA@testdomain.com",
		ID:    "userA",
	}

	s.mocks.userRepo.On("GetByEmail", user.Email).Return(user, nil)
	s.mocks.settingRepo.On("Get").Return(&entity.Setting{}, unexpectedErr)

	err := s.authInteractor.SignIn(user.Email, verificationCodeDurationInMinutes)
	require.Equal(t, unexpectedErr, err)
}

func (s *AuthSuite) TestSignInErrInvalidEmail() {
	t := s.T()

	email := "invalidemailaddress"

	err := s.authInteractor.SignIn(email, 1)
	require.Equal(t, usecase.ErrUserEmailInvalid, err)
}

func (s *AuthSuite) TestSignInErrStoringValidationCode() {
	t := s.T()

	unexpectedErr := errors.New("unexpected error")
	verificationCode := "test_verification_code"
	verificationCodeDurationInMinutes := 1
	user := &entity.User{
		Email: "userA@testdomain.com",
		ID:    "userA",
	}
	settings := &entity.Setting{
		SessionLifetimeInDays: 0,
		AuthAllowedDomains:    []string{},
	}

	s.mocks.userRepo.On("GetByEmail", user.Email).Return(user, nil)
	s.mocks.settingRepo.On("Get").Return(settings, nil)
	s.mocks.verificationCodeGenerator.On("Generate").Return(verificationCode)
	s.mocks.verificationCodeRepo.On("Store", verificationCode, user.ID, mock.Anything).Return(unexpectedErr)

	err := s.authInteractor.SignIn(user.Email, verificationCodeDurationInMinutes)
	require.Equal(t, unexpectedErr, err)
}

func (s *AuthSuite) TestSignUpErrCreatingUser() {
	t := s.T()

	unexpectedErr := errors.New("unexpected error")
	verificationCode := "test_verification_code"
	verificationCodeDurationInMinutes := 1
	domain := "testdomain.com"
	user := &entity.User{
		Email: "userA@" + domain,
		ID:    "userA",
	}
	settings := &entity.Setting{
		SessionLifetimeInDays: 0,
		AuthAllowedDomains:    []string{domain},
	}

	s.mocks.userRepo.On("GetByEmail", user.Email).Return(nil, usecase.ErrUserNotFound)
	s.mocks.settingRepo.On("Get").Return(settings, nil)
	s.mocks.verificationCodeGenerator.On("Generate").Return(verificationCode)
	s.mocks.userRepo.On("Create", user.Email).Return(nil, unexpectedErr)

	err := s.authInteractor.SignIn(user.Email, verificationCodeDurationInMinutes)
	require.Equal(t, unexpectedErr, err)
}

func (s *AuthSuite) TestVerifyCode() {
	t := s.T()

	code := "test_verification_code"
	verificationCode := &entity.VerificationCode{
		Code:      code,
		UID:       "userA",
		ExpiresAt: time.Now().Add(time.Duration(1) * time.Minute),
	}
	user := &entity.User{
		ID:    verificationCode.UID,
		Email: "userA@testdomain.com",
	}

	s.mocks.verificationCodeRepo.On("Get", code).Return(verificationCode, nil)
	s.mocks.verificationCodeRepo.On("Delete", code).Return(nil)

	s.mocks.userRepo.On("GetByID", verificationCode.UID).Return(user, nil)
	s.mocks.userActivityRepo.On("Create", mock.Anything).Return(nil)

	userId, err := s.authInteractor.VerifyCode(code)
	require.Nil(t, err)
	require.Equal(t, verificationCode.UID, userId)
}

func (s *AuthSuite) TestVerifyNotFoundCode() {
	t := s.T()

	code := "test_verification_code"
	s.mocks.verificationCodeRepo.On("Get", code).Return(nil, usecase.ErrVerificationCodeNotFound)

	_, err := s.authInteractor.VerifyCode(code)
	require.Equal(t, usecase.ErrVerificationCodeNotFound, err)
}

func (s *AuthSuite) TestVerifyExpiredCode() {
	t := s.T()

	code := "test_verification_code"
	verificationCode := &entity.VerificationCode{
		Code:      code,
		UID:       "userA",
		ExpiresAt: time.Now().Add(time.Duration(-1) * time.Minute),
	}

	s.mocks.verificationCodeRepo.On("Get", code).Return(verificationCode, nil)
	s.mocks.verificationCodeRepo.On("Delete", code).Return(nil)

	_, err := s.authInteractor.VerifyCode(code)
	require.Equal(t, usecase.ErrExpiredVerificationCode, err)
}

func (s *AuthSuite) TestVerifyCodeErrCreatingUserActivity() {
	t := s.T()

	unexpectedErr := errors.New("unexpected error")
	code := "test_verification_code"
	verificationCode := &entity.VerificationCode{
		Code:      code,
		UID:       "userA",
		ExpiresAt: time.Now().Add(time.Duration(1) * time.Minute),
	}
	user := &entity.User{
		ID:    verificationCode.UID,
		Email: "userA@testdomain.com",
	}

	s.mocks.verificationCodeRepo.On("Get", code).Return(verificationCode, nil)
	s.mocks.verificationCodeRepo.On("Delete", code).Return(nil)

	s.mocks.userRepo.On("GetByID", verificationCode.UID).Return(user, nil)
	s.mocks.userActivityRepo.On("Create", mock.Anything).Return(unexpectedErr)

	_, err := s.authInteractor.VerifyCode(code)
	require.Equal(t, unexpectedErr, err)
}

func (s *AuthSuite) TestVerifyCodeErrDeletingValidationCode() {
	t := s.T()

	unexpectedErr := errors.New("unexpected error")
	code := "test_verification_code"
	verificationCode := &entity.VerificationCode{
		Code:      code,
		UID:       "userA",
		ExpiresAt: time.Now().Add(time.Duration(1) * time.Minute),
	}
	user := &entity.User{
		ID:    verificationCode.UID,
		Email: "userA@testdomain.com",
	}

	s.mocks.verificationCodeRepo.On("Get", code).Return(verificationCode, nil)
	s.mocks.verificationCodeRepo.On("Delete", code).Return(unexpectedErr)

	s.mocks.userRepo.On("GetByID", verificationCode.UID).Return(user, nil)
	s.mocks.userActivityRepo.On("Create", mock.Anything).Return(nil)

	userId, err := s.authInteractor.VerifyCode(code)
	require.Nil(t, err)
	require.Equal(t, verificationCode.UID, userId)
}
