package auth

import (
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/admin/admin-api/mocks"
)

type tokenManagerSuite struct {
	ctrl         *gomock.Controller
	tokenManager auth.TokenManager
	mocks        tokenManagerSuiteMocks
}

type tokenManagerSuiteMocks struct {
	cfg    *config.Config
	logger *mocks.MockLogger
}

func newTokenManagerSuite(t *testing.T) *tokenManagerSuite {
	ctrl := gomock.NewController(t)
	logger := mocks.NewMockLogger(ctrl)
	mocks.AddLoggerExpects(logger)

	cfg := &config.Config{}
	cfg.Auth.APIToken.CipherSecret = "randomLengthSecret"
	tokenManager := NewTokenManager(cfg, logger)
	return &tokenManagerSuite{
		ctrl:         ctrl,
		tokenManager: tokenManager,
		mocks: tokenManagerSuiteMocks{
			cfg,
			logger,
		},
	}
}

func TestEncryptAndDecrypt(t *testing.T) {
	s := newTokenManagerSuite(t)
	defer s.ctrl.Finish()

	textToEncrypt := "This is a test"
	textEncrypted, err := s.tokenManager.Encrypt(textToEncrypt)
	require.NoError(t, err)

	textDecrypted, _ := s.tokenManager.Decrypt(textEncrypted)
	require.NoError(t, err)

	require.Equal(t, textToEncrypt, textDecrypted)
}
