package controller

import (
	"gitlab.com/konstellation/konstellation-ce/kst-runtime/api/domain/usecase/logging"
	"net/http"

	"github.com/labstack/echo"
	"gitlab.com/konstellation/konstellation-ce/kst-runtime/api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kst-runtime/api/domain/usecase"
)

type signInInput struct {
	Email string `json:"email" validate:"email"`
}

type AuthController struct {
	cfg            *config.Config
	logger         logging.Logger
	authInteractor *usecase.AuthInteractor
}

func NewAuthController(cfg *config.Config, logger logging.Logger, authInteractor *usecase.AuthInteractor) *AuthController {
	return &AuthController{
		cfg,
		logger,
		authInteractor,
	}
}

func (a *AuthController) SignIn(c echo.Context) error {
	input := new(signInInput)
	if err := c.Bind(input); err != nil {
		return InvalidJSONError
	}

	if err := c.Validate(input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, newResponseValidationError(err))
	}

	frontEndBaseURL := a.cfg.Server.FrontEndBaseURL
	tokenDurationInHours := a.cfg.Auth.TokenDurationInHours
	if err := a.authInteractor.SignIn(input.Email, frontEndBaseURL, tokenDurationInHours); err != nil {
		switch err {
		case usecase.ErrUserNotFound:
			return echo.NewHTTPError(http.StatusUnauthorized, "The email is not registered.")
		default:
			return UnexpectedError
		}

	}

	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Email sent to the user."})
}
