package usecase

import (
	"errors"
	"fmt"
	"github.com/go-playground/validator"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/auth"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"strings"
	"time"
)

// AuthInteractor will manage all things related to authorizations.
type AuthInteractor struct {
	logger                    logging.Logger
	loginLinkTransport        auth.LoginLinkTransport
	verificationCodeGenerator auth.VerificationCodeGenerator
	verificationCodeRepo      repository.VerificationCodeRepo
	userRepo                  repository.UserRepo
	settingRepo               repository.SettingRepo
	userActivityInteractor    *UserActivityInteractor
}

// NewAuthInteractor creates a new AuthInteractor.
func NewAuthInteractor(
	logger logging.Logger,
	loginLinkTransport auth.LoginLinkTransport,
	verificationCodeGenerator auth.VerificationCodeGenerator,
	verificationCodeRepo repository.VerificationCodeRepo,
	userRepo repository.UserRepo,
	settingRepo repository.SettingRepo,
	userActivityInteractor *UserActivityInteractor,
) *AuthInteractor {
	return &AuthInteractor{
		logger,
		loginLinkTransport,
		verificationCodeGenerator,
		verificationCodeRepo,
		userRepo,
		settingRepo,
		userActivityInteractor,
	}
}

var (
	// ErrUserNotFound error
	ErrUserNotFound = errors.New("error user not found")
	// ErrUserNotFound error
	ErrUserEmailInvalid = errors.New("error user email is not valid")
	// ErrVerificationCodeNotFound error
	ErrVerificationCodeNotFound = errors.New("error the verification not found")
	// ErrExpiredVerificationCode error
	ErrExpiredVerificationCode = errors.New("error the verification code code is expired")
	// ErrDomainNotAllowed error
	ErrDomainNotAllowed = errors.New("error domain not allowed")
)

// SignIn creates a temporal on-time-use verification code associated with the user and sends it to the user in the form of a “login link” via email, sms or whatever.
func (a *AuthInteractor) SignIn(email string, verificationCodeDurationInMinutes int) error {
	validate := validator.New()
	err := validate.Var(email, "required,email")
	if err != nil {
		return ErrUserEmailInvalid
	}

	user, err := a.userRepo.GetByEmail(email)
	isNewUser := false
	if err == ErrUserNotFound {
		isNewUser = true
	} else if err != nil {
		return err
	}

	// Get allowed domain list
	settings, err := a.settingRepo.Get()
	if err != nil {
		return err
	}

	// Check email domain is an allowed domain
	isAllowed := false
	if len(settings.AuthAllowedDomains) == 0 {
		a.logger.Warn("All domains are allowed for sign-up, set allowed domains in the security settings")
		isAllowed = true
	} else {
		split := strings.Split(email, "@")
		domain := split[1]

		for _, d := range settings.AuthAllowedDomains {
			if d == domain {
				a.logger.Info(fmt.Sprintf("Email domain '%s' is allowed", domain))
				isAllowed = true
				break
			}
		}

		if !isAllowed {
			a.logger.Info(fmt.Sprintf("Email domain '%s' is not in the allowed domain list", domain))
		}
	}

	if !isAllowed {
		return ErrDomainNotAllowed
	}

	// SignUp user creation
	if isNewUser {
		a.logger.Info(fmt.Sprintf("The user '%s' doesn't exist, creating in the database...", email))

		createdUser, err := a.userRepo.Create(email)
		if err != nil {
			return err
		}

		user = createdUser
	}

	a.logger.Info("Creating a new verification code...")
	ttl := time.Duration(verificationCodeDurationInMinutes) * time.Minute
	verificationCode := a.verificationCodeGenerator.Generate()

	err = a.verificationCodeRepo.Store(verificationCode, user.ID, ttl)
	if err != nil {
		return err
	}

	a.logger.Info("Sending login link...")
	return a.loginLinkTransport.Send(user.Email, verificationCode)
}

// VerifyCode checks that the given VerificationCode is valid
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
	err = a.userActivityInteractor.Create(verificationCode.UID, UserActivityTypeLogin, []entity.UserActivityVar{})
	if err != nil {
		return "", err
	}

	return verificationCode.UID, nil
}

// Logout register the User logout request
func (a *AuthInteractor) Logout(userID string) error {
	return a.userActivityInteractor.Create(userID, UserActivityTypeLogout, []entity.UserActivityVar{})
}
