package controller

import (
	"github.com/dgrijalva/jwt-go"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"net/http"
	"time"

	"github.com/labstack/echo"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
)

type signInInput struct {
	Email string `json:"email" validate:"email"`
}

type signinVerifyInput struct {
	VerificationCode string `json:"verificationCode" validate:"required"`
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

	verificationCodeDurationInMinutes := a.cfg.Auth.VerificationCodeDurationInMinutes
	if err := a.authInteractor.SignIn(input.Email, verificationCodeDurationInMinutes); err != nil {
		switch err {
		case usecase.ErrUserNotFound:
			return echo.NewHTTPError(http.StatusUnauthorized, "The email is not registered.")
		default:
			return UnexpectedError
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Email sent to the user."})
}

func (a *AuthController) SignInVerify(c echo.Context) error {
	input := new(signinVerifyInput)
	if err := c.Bind(input); err != nil {
		return InvalidJSONError
	}

	if err := c.Validate(input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, newResponseValidationError(err))
	}

	userId, err := a.authInteractor.VerifyCode(input.VerificationCode)
	if err != nil {
		switch err {
		case usecase.ErrExpiredVerificationCode:
		case usecase.ErrVerificationCodeNotFound:
			return echo.NewHTTPError(http.StatusBadRequest, "The verification code is not valid.")
		default:
			return UnexpectedError
		}
	}

	// Generate JWT token
	ttl := time.Duration(a.cfg.Auth.SessionDurationInHours) * time.Hour
	expirationTime := time.Now().Add(ttl)

	claims := jwt.StandardClaims{
		Subject:   userId,
		ExpiresAt: expirationTime.Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	jwtKey := []byte(a.cfg.Auth.JWTSignSecret)
	jwtToken, err := token.SignedString(jwtKey)
	if err != nil {
		return err
	}

	// Set cookie containing the generated JWT token
	cookie := new(http.Cookie)
	cookie.Name = "token"
	cookie.Value = jwtToken
	cookie.Expires = expirationTime
	cookie.Path = "/"
	cookie.Secure = a.cfg.Auth.SecureCookie
	cookie.HttpOnly = true
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Login success"})
}
