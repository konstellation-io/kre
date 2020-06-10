package controller

import (
	"gitlab.com/konstellation/kre/admin-api/delivery/http/httperrors"
	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"

	"gitlab.com/konstellation/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase/logging"
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
		return httperrors.HTTPErrInvalidJSON
	}

	if err := c.Validate(input); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, newResponseValidationError(err))
	}

	verificationCodeDurationInMinutes := a.cfg.Auth.VerificationCodeDurationInMinutes
	if err := a.authInteractor.SignIn(input.Email, verificationCodeDurationInMinutes); err != nil {
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
		case usecase.ErrExpiredVerificationCode:
		case usecase.ErrVerificationCodeNotFound:
			return httperrors.HTTPErrVerificationCodeNotFound
		default:
			a.logger.Error(err.Error())
			return httperrors.HTTPErrUnexpected
		}
	}

	a.logger.Info("Generating JWT token.")
	setting, err := a.settingInteractor.Get()
	if err != nil {
		return err
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
	if err != nil {
		return err
	}

	a.logger.Info("Set cookie containing the generated JWT token.")
	cookie := a.createCookie(jwtToken, expirationDate)
	c.SetCookie(cookie)

	err = a.authInteractor.CreateSession(entity.Session{
		UserID:         userId,
		Token:          jwtToken,
		CreationDate:   time.Now(),
		ExpirationDate: expirationDate,
	})
	if err != nil {
		a.logger.Errorf("Error creating session: %s", err)
		return httperrors.HTTPErrUnexpected
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Login success"})
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

	expirationTime := time.Now()
	cookie := a.createCookie("deleted", expirationTime)
	c.SetCookie(cookie)

	return c.JSON(http.StatusOK, map[string]interface{}{"message": "Logout success"})
}

func (a *AuthController) createCookie(jwtToken string, expirationTime time.Time) *http.Cookie {
	cookie := new(http.Cookie)
	cookie.Name = "token"
	cookie.Value = jwtToken
	cookie.Expires = expirationTime
	cookie.Path = "/"
	cookie.HttpOnly = true
	cookie.Secure = a.cfg.Auth.SecureCookie
	cookie.SameSite = http.SameSiteLaxMode
	cookie.Domain = a.cfg.Auth.CookieDomain
	return cookie
}
