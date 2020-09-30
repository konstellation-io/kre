package auth

import (
	"github.com/golang/mock/gomock"
	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/admin/admin-api/mocks"
	"github.com/stretchr/testify/require"
	"testing"
)

type cipherSuite struct {
	ctrl   *gomock.Controller
	cipher auth.Cipher
	mocks  cipherSuiteMocks
}

type cipherSuiteMocks struct {
	cfg    *config.Config
	logger *mocks.MockLogger
}

func newCipherSuite(t *testing.T) *cipherSuite {
	ctrl := gomock.NewController(t)
	logger := mocks.NewMockLogger(ctrl)
	mocks.AddLoggerExpects(logger)

	cfg := &config.Config{}
	cfg.Auth.ApiToken.CipherSecret = "a16or32digitskey"
	cipher, _ := NewCipher(cfg, logger)
	return &cipherSuite{
		ctrl:   ctrl,
		cipher: cipher,
		mocks: cipherSuiteMocks{
			cfg,
			logger,
		},
	}
}

func TestEncryptAndDecrypt(t *testing.T) {
	s := newCipherSuite(t)
	defer s.ctrl.Finish()

	textToEncrypt := "Esto es una prueba"
	textEncrypted, err := s.cipher.Encrypt(textToEncrypt)
	require.Nil(t, err)

	textDecrypted, _ := s.cipher.Decrypt(textEncrypted)
	require.Nil(t, err)

	require.Equal(t, textToEncrypt, textDecrypted)
}
