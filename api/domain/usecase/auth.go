package usecase

import (
	"errors"
	"fmt"
	"gitlab.com/konstellation/konstellation-ce/kst-runtime/api/domain/repository"
	"gitlab.com/konstellation/konstellation-ce/kst-runtime/api/domain/usecase/auth"
	"gitlab.com/konstellation/konstellation-ce/kst-runtime/api/domain/usecase/logging"
	"time"
)

// AuthInteractor will manage all things related to authorizations.
type AuthInteractor struct {
	logger         logging.Logger
	tokenRepo      repository.TokenRepo
	tokenGenerator auth.TokenGenerator
	tokenTransport auth.TokenTransport
	userRepo       repository.UserRepo
}

// NewAuthInteractor creates a new AuthInteractor.
func NewAuthInteractor(
	logger logging.Logger,
	tokenGenerator auth.TokenGenerator,
	tokenTransport auth.TokenTransport,
	tokenRepo repository.TokenRepo,
	userRepo repository.UserRepo,
) *AuthInteractor {
	return &AuthInteractor{
		logger,
		tokenRepo,
		tokenGenerator,
		tokenTransport,
		userRepo,
	}
}

var (
	ErrUserNotFound = errors.New("error user not found")
)

// SignIn creates a temporal on-time-use token associated with the user and sends it to the user in the form of a “magic link” via email, sms or whatever.
func (a *AuthInteractor) SignIn(email, frontEndBaseURL string, tokenDurationInHours int) error {
	user, err := a.userRepo.GetByEmail(email)
	if err != nil {
		return err
	}

	if user == nil {
		return ErrUserNotFound
	}

	ttl := time.Duration(tokenDurationInHours) * time.Hour
	token, err := a.tokenGenerator.Generate()
	if err != nil {
		return err
	}

	err = a.tokenRepo.Store(token, user.ID, ttl)
	if err != nil {
		return err
	}

	loginLink := fmt.Sprintf("%s/login?otp=%s", frontEndBaseURL, token)
	subject := "KST Runtime SigIn"
	message := fmt.Sprintf("Your login link:\n%s", loginLink)

	return a.tokenTransport.Send(user.Email, subject, message)
}
