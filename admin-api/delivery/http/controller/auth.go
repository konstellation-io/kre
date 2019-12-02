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
	Email string `json:"email" validate:"required,email"`
}

type signinVerifyInput struct {
	VerificationCode string `json:"verificationCode" validate:"required"`
}

type AuthController struct {
	cfg               *config.Config
	logger            logging.Logger
	authInteractor    *usecase.AuthInteractor
	settingInteractor *usecase.SettingInteractor
}

func NewAuthController(
	cfg *config.Config,
	logger logging.Logger,
	authInteractor *usecase.AuthInteractor,
	settingInteractor *usecase.SettingInteractor,
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
		return HTTPErrInvalidJSON
	}

	if err := c.Validate(input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, newResponseValidationError(err))
	}

	verificationCodeDurationInMinutes := a.cfg.Auth.VerificationCodeDurationInMinutes
	if err := a.authInteractor.SignIn(input.Email, verificationCodeDurationInMinutes); err != nil {
		switch err {
		case usecase.ErrDomainNotAllowed:
			return HTTPErrDomainNotAllowed
		default:
			a.logger.Error(err.Error())
			return HTTPErrUnexpected
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Email sent to the user."})
}

func (a *AuthController) SignInVerify(c echo.Context) error {
	input := new(signinVerifyInput)
	if err := c.Bind(input); err != nil {
		return HTTPErrInvalidJSON
	}

	if err := c.Validate(input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, newResponseValidationError(err))
	}

	a.logger.Info("Verifying authorization code.")
	userId, err := a.authInteractor.VerifyCode(input.VerificationCode)
	if err != nil {
		switch err {
		case usecase.ErrExpiredVerificationCode:
		case usecase.ErrVerificationCodeNotFound:
			return HTTPErrVerificationCodeNotFound
		default:
			a.logger.Error(err.Error())
			return HTTPErrUnexpected
		}
	}

	a.logger.Info("Generating JWT token.")
	setting, err := a.settingInteractor.Get()
	if err != nil {
		return err
	}

	ttl := time.Duration(setting.SessionLifetimeInDays) * 24 * time.Hour
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

	a.logger.Info("Set cookie containing the generated JWT token.")
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

func (a *AuthController) Logout(c echo.Context) error {
	user := c.Get("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)
	userID := claims["sub"].(string)

	a.logger.Info("Logout for user " + userID)

	expirationTime := time.Now()
	cookie := new(http.Cookie)
	cookie.Name = "token"
	cookie.Value = "deleted"
	cookie.Expires = expirationTime
	cookie.Path = "/"
	cookie.Secure = a.cfg.Auth.SecureCookie
	cookie.HttpOnly = true
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Logout success"})
}
