package usecase

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/go-playground/validator"

	"github.com/konstellation-io/kre/admin-api/domain/entity"
	"github.com/konstellation-io/kre/admin-api/domain/repository"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/admin-api/domain/usecase/logging"
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
	sessionRepo               repository.SessionRepo
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
	sessionRepo repository.SessionRepo,
) *AuthInteractor {
	return &AuthInteractor{
		logger,
		loginLinkTransport,
		verificationCodeGenerator,
		verificationCodeRepo,
		userRepo,
		settingRepo,
		userActivityInteractor,
		sessionRepo,
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
	// ErrInvalidSession error
	ErrInvalidSession = errors.New("error invalid session")
	// ErrExpiredSession error
	ErrExpiredSession = errors.New("error expired session")
	// ErrSessionNotFound error
	ErrSessionNotFound = errors.New("error session not found")
)

// SignIn creates a temporal on-time-use verification code associated with the user and sends it to the user in the form of a “login link” via email, sms or whatever.
func (a *AuthInteractor) SignIn(ctx context.Context, email string, verificationCodeDurationInMinutes int) error {
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

	// SignUp user creation
	if isNewUser {
		// Get allowed domain lists
		settings, err := a.settingRepo.Get(ctx)
		if err != nil {
			return err
		}

		// Check if there are allowed domains
		if len(settings.AuthAllowedDomains) != 0 {
			// Check if the email domain is an allowed domain
			if !a.isDomainAllowed(settings, email) {
				return ErrUserNotAllowed
			}
		} else {
			a.logger.Warn("All emails are allowed for sign-up, set allowed domains in security settings")
		}

		a.logger.Infof("The user '%s' doesn't exist, creating in the database...", email)

		createdUser, err := a.userRepo.Create(context.Background(), email, entity.AccessLevelViewer)
		if err != nil {
			return err
		}

		user = createdUser
	}

	if user == nil {
		return ErrUserNotFound
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

func (a *AuthInteractor) isDomainAllowed(settings *entity.Settings, email string) bool {
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

// Logout deletes the stored token and registers the User logout request
func (a *AuthInteractor) Logout(userID, token string) error {
	err := a.sessionRepo.DeleteByToken(token)
	if err != nil {
		return err
	}

	return a.userActivityInteractor.RegisterLogout(userID)
}

func (a *AuthInteractor) CreateSession(session entity.Session) error {
	return a.sessionRepo.Create(session)
}

func (a *AuthInteractor) CheckSessionIsActive(token string) error {
	session, err := a.sessionRepo.GetByToken(token)
	if err != nil {
		a.logger.Errorf("Error getting session: %s", err)
		return ErrInvalidSession
	}

	user, err := a.userRepo.GetByID(session.UserID)
	if err != nil {
		return err
	}

	if user.Deleted {
		a.logger.Infof("The session is not valid because the user %s is deleted", user.ID)
		return ErrInvalidSession
	}

	if time.Now().After(session.ExpirationDate) {
		err = a.sessionRepo.DeleteByToken(token)
		if err != nil {
			a.logger.Errorf("Error deleting session: %s", err)
		}
		return ErrExpiredSession
	}

	return nil
}

func (a *AuthInteractor) RevokeUserSessions(userIDs []string, loggedUser, comment string) error {
	users, err := a.userRepo.GetByIDs(userIDs)
	if err != nil {
		return err
	}

	foundUserIDs := make([]string, len(users))
	foundUserEmails := make([]string, len(users))
	for i, u := range users {
		foundUserIDs[i] = u.ID
		foundUserEmails[i] = u.Email
	}

	err = a.sessionRepo.DeleteByUserIDs(foundUserIDs)
	if err != nil {
		return err
	}

	a.userActivityInteractor.RegisterRevokeSessions(loggedUser, foundUserIDs, foundUserEmails, comment)

	return nil
}

func (a *AuthInteractor) UpdateLastActivity(loggedUserID string) error {
	return a.userRepo.UpdateLastActivity(loggedUserID)
}

func (a *AuthInteractor) CountUserSessions(ctx context.Context, userID string) (int, error) {
	sessions, err := a.sessionRepo.GetUserSessions(ctx, userID)
	if err != nil {
		return -1, err
	}
	return len(sessions), nil
}
