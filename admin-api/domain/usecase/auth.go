package usecase

import (
	"errors"
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/auth"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"time"
)

// AuthInteractor will manage all things related to authorizations.
type AuthInteractor struct {
	logger                    logging.Logger
	loginLinkTransport        auth.LoginLinkTransport
	verificationCodeGenerator auth.VerificationCodeGenerator
	verificationCodeRepo      repository.VerificationCodeRepo
	userRepo                  repository.UserRepo
}

// NewAuthInteractor creates a new AuthInteractor.
func NewAuthInteractor(logger logging.Logger, loginLinkTransport auth.LoginLinkTransport, verificationCodeGenerator auth.VerificationCodeGenerator, verificationCodeRepo repository.VerificationCodeRepo, userRepo repository.UserRepo) *AuthInteractor {
	return &AuthInteractor{
		logger,
		loginLinkTransport,
		verificationCodeGenerator,
		verificationCodeRepo,
		userRepo,
	}
}

var (
	ErrUserNotFound             = errors.New("error user not found")
	ErrVerificationCodeNotFound = errors.New("error the verification not found")
	ErrExpiredVerificationCode  = errors.New("error the verification code code is expired")
)

// SignIn creates a temporal on-time-use verification code associated with the user and sends it to the user in the form of a “login link” via email, sms or whatever.
func (a *AuthInteractor) SignIn(email string, verificationCodeDurationInMinutes int) error {
	var user *entity.User
	user, err := a.userRepo.GetByEmail(email)
	// SignUp
	if err == ErrUserNotFound {
		a.logger.Info(fmt.Sprintf("SignUp %s", email))
		user, err = a.userRepo.Create(email)
		if err != nil {
			return err
		}
	} else if err != nil {
		return err
	}

	// Create a new verification code
	ttl := time.Duration(verificationCodeDurationInMinutes) * time.Minute
	verificationCode := a.verificationCodeGenerator.Generate()

	err = a.verificationCodeRepo.Store(verificationCode, user.ID, ttl)
	if err != nil {
		return err
	}

	// Send login link
	return a.loginLinkTransport.Send(user.Email, verificationCode)
}

func (a *AuthInteractor) VerifyCode(code string) (string, error) {
	verificationCode, err := a.verificationCodeRepo.Get(code)
	if err != nil {
		return "", err
	}

	defer func() {
		err = a.verificationCodeRepo.Delete(code)
		if err != nil {
			a.logger.Error("Unexpected error deleting the verification code = " + code)
		}
	}()

	if verificationCode.ExpiresAt.Before(time.Now().UTC()) {
		a.logger.Info("The verification code is expired")
		return "", ErrExpiredVerificationCode
	}

	a.logger.Info("The verification code is valid")
	return verificationCode.UID, nil
}
