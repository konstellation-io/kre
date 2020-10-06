package controller

import (
	"context"
	"net/http"
	"time"

	"github.com/konstellation-io/kre/admin/admin-api/delivery/http/auth"
	"github.com/konstellation-io/kre/admin/admin-api/delivery/http/httperrors"
	"github.com/konstellation-io/kre/admin/admin-api/domain/entity"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
)

type signInInput struct {
	Email string `json:"email" validate:"required,email"`
}

type apiTokenInput struct {
	APIToken string `json:"apiToken" validate:"required"`
}

type signinVerifyInput struct {
	VerificationCode string `json:"verificationCode" validate:"required"`
}

type AuthController struct {
	cfg               *config.Config
	logger            logging.Logger
	authInteractor    usecase.AuthInteracter
	settingInteractor usecase.SettingInteracter
}

func NewAuthController(
	cfg *config.Config,
	logger logging.Logger,
	authInteractor usecase.AuthInteracter,
	settingInteractor usecase.SettingInteracter,
) *AuthController {
	return &AuthController{
		cfg,
		logger,
		authInteractor,
		settingInteractor,
	}
}

func (a *AuthController) SignIn(c echo.Context) error {
	input := new(signInInput)
	if err := c.Bind(input); err != nil {
		return httperrors.HTTPErrInvalidJSON
	}

	if err := c.Validate(input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, newResponseValidationError(err))
	}

	verificationCodeDurationInMinutes := a.cfg.Auth.VerificationCodeDurationInMinutes
	if err := a.authInteractor.SignIn(c.Request().Context(), input.Email, verificationCodeDurationInMinutes); err != nil {
		switch err {
		case usecase.ErrUserNotAllowed:
			return httperrors.HTTPErrUserNotAllowed
		default:
			a.logger.Error(err.Error())
			return httperrors.HTTPErrUnexpected
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Email sent to the user."})
}

func (a *AuthController) SignInVerify(c echo.Context) error {
	input := new(signinVerifyInput)
	if err := c.Bind(input); err != nil {
		return httperrors.HTTPErrInvalidJSON
	}

	if err := c.Validate(input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, newResponseValidationError(err))
	}

	a.logger.Info("Verifying authorization code.")
	userId, err := a.authInteractor.VerifyCode(input.VerificationCode)
	if err != nil {
		switch err {
		case usecase.ErrExpiredVerificationCode, usecase.ErrVerificationCodeNotFound:
			return httperrors.HTTPErrVerificationCodeNotFound
		default:
			a.logger.Error(err.Error())
			return httperrors.HTTPErrUnexpected
		}
	}

	jwtToken, expirationDate, err := a.generateAccessToken(c.Request().Context(), userId)
	if err != nil {
		a.logger.Errorf("Error generating token: %s", err)
		return httperrors.HTTPErrUnexpected
	}

	a.logger.Info("Set cookie containing the generated JWT token.")
	auth.CreateSessionCookie(c, a.cfg, jwtToken, *expirationDate)

	err = a.authInteractor.CreateSession(entity.Session{
		UserID:         userId,
		Token:          jwtToken,
		CreationDate:   time.Now(),
		ExpirationDate: *expirationDate,
	})
	if err != nil {
		a.logger.Errorf("Error creating session: %s", err)
		return httperrors.HTTPErrUnexpected
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Login success"})
}

func (a *AuthController) SignInWithAPIToken(c echo.Context) error {
	input := new(apiTokenInput)
	if err := c.Bind(input); err != nil {
		return httperrors.HTTPErrInvalidJSON
	}

	if err := c.Validate(input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, newResponseValidationError(err))
	}

	userID, err := a.authInteractor.VerifyAPIToken(c.Request().Context(), input.APIToken)
	if err != nil {
		a.logger.Errorf("Error SignInWithAPIToken: %s", err)
		return httperrors.HTTPErrUnauthorized
	}

	jwtToken, expirationDate, err := a.generateAccessToken(c.Request().Context(), userID)
	if err != nil {
		a.logger.Errorf("Error generating token: %s", err)
		return httperrors.HTTPErrUnexpected
	}

	err = a.authInteractor.CreateSession(entity.Session{
		UserID:         userID,
		Token:          jwtToken,
		CreationDate:   time.Now(),
		ExpirationDate: *expirationDate,
	})
	if err != nil {
		a.logger.Errorf("Error creating session: %s", err)
		return httperrors.HTTPErrUnexpected
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"access_token": jwtToken})
}

func (a *AuthController) generateAccessToken(c context.Context, userId string) (string, *time.Time, error) {
	a.logger.Info("Generating JWT token.")
	setting, err := a.settingInteractor.GetUnprotected(c)
	if err != nil {
		return "", nil, err
	}

	ttl := time.Duration(setting.SessionLifetimeInDays) * 24 * time.Hour
	expirationDate := time.Now().Add(ttl)

	claims := jwt.StandardClaims{
		Subject:   userId,
		ExpiresAt: expirationDate.Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	jwtKey := []byte(a.cfg.Auth.JWTSignSecret)
	jwtToken, err := token.SignedString(jwtKey)
	return jwtToken, &expirationDate, err
}

func (a *AuthController) Logout(c echo.Context) error {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["sub"].(string)

	a.logger.Info("Logout for user " + userID)
	err := a.authInteractor.Logout(userID, user.Raw)
	if err != nil {
		a.logger.Errorf("Unexpected error in logout: %s", err.Error())
	}

	auth.DeleteSessionCookie(c, a.cfg)

	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Logout success"})
}
