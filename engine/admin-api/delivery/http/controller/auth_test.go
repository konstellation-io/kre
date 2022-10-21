package controller

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-playground/validator"
	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/mocks"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

type testValidator struct {
	validator *validator.Validate
}

func (tv *testValidator) Validate(i interface{}) error {
	return tv.validator.Struct(i)
}

func TestSignInWithAPIToken(t *testing.T) {
	ctrl := gomock.NewController(t)
	logger := mocks.NewMockLogger(ctrl)
	mocks.AddLoggerExpects(logger)

	authInteractor := mocks.NewMockAuthInteracter(ctrl)
	settingInteractor := mocks.NewMockSettingInteracter(ctrl)

	apiTokenJSON := `{"apiToken":"123456"}`
	userID := "user1"
	// Setup
	e := echo.New()
	e.Validator = &testValidator{validator: validator.New()}
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(apiTokenJSON))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	authInteractor.EXPECT().VerifyAPIToken(c.Request().Context(), "123456").Return(userID, nil)
	authInteractor.EXPECT().CreateSession(gomock.Any()).Return(nil)
	settingInteractor.EXPECT().GetUnprotected(c.Request().Context()).Return(&entity.Settings{
		SessionLifetimeInDays: 1,
	}, nil)

	cfg := &config.Config{}
	h := NewAuthController(cfg, logger, authInteractor, settingInteractor)

	// Assertions
	if assert.NoError(t, h.SignInWithAPIToken(c)) {
		assert.Equal(t, http.StatusOK, rec.Code)
		assert.NotEmpty(t, rec.Body.String())
	}
}
