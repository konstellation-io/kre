package usecase

import (
	"errors"
	"strings"
	"time"

	"github.com/go-playground/validator"

	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/repository"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/auth"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
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
	// ErrUserNotAllowed error
	ErrUserNotAllowed = errors.New("error email address not allowed")
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

	// Get allowed domain/email lists
	settings, err := a.settingRepo.Get()
	if err != nil {
		return err
	}

	isAllowed := false
	domainsInWhitelist := len(settings.AuthAllowedDomains) != 0
	emailsInWhitelist := len(settings.AuthAllowedEmails) != 0

	// Check if there is no emails and domains in the whitelists
	if !domainsInWhitelist && !emailsInWhitelist {
		a.logger.Warn("All emails are allowed for sign-up, set allowed domains or email addresses in security settings")
		isAllowed = true
	}

	// Check email domain is an allowed domain
	if !isAllowed && domainsInWhitelist {
		isAllowed = a.isDomainAllowed(settings, email)
	}

	// Check email address is an allowed address
	if !isAllowed && emailsInWhitelist {
		isAllowed = a.isEmailAllowed(settings, email)
	}

	if !isAllowed {
		return ErrUserNotAllowed
	}

	// SignUp user creation
	if isNewUser {
		a.logger.Infof("The user '%s' doesn't exist, creating in the database...", email)

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

func (a *AuthInteractor) isDomainAllowed(settings *entity.Setting, email string) bool {
	split := strings.Split(email, "@")
	domain := split[1]

	for _, d := range settings.AuthAllowedDomains {
		if d == domain {
			a.logger.Infof("Email domain '%s' is allowed", domain)
			return true
		}
	}

	a.logger.Infof("Email domain '%s' is not in the allowed domain list", domain)

	return false
}

func (a *AuthInteractor) isEmailAllowed(settings *entity.Setting, email string) bool {
	for _, e := range settings.AuthAllowedEmails {
		if e == email {
			a.logger.Infof("Email address '%s' is allowed", email)
			return true
		}
	}

	a.logger.Infof("Email address '%s' is not in the allowed email list", email)

	return false
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
	err = a.userActivityInteractor.RegisterLogin(verificationCode.UID)
	if err != nil {
		return "", err
	}

	return verificationCode.UID, nil
}

// Logout register the User logout request
func (a *AuthInteractor) Logout(userID string) error {
	return a.userActivityInteractor.RegisterLogout(userID)
}
