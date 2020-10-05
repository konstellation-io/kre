package auth

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"

	"golang.org/x/crypto/scrypt"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
)

type (
	TokenManager struct {
		keyConf keyConf
		cfg     *config.Config
		logger  logging.Logger
	}
	keyConf struct {
		// Cost must be a power of two greater than 1
		Cost int
		Len  int
	}
)

func NewTokenManager(cfg *config.Config, logger logging.Logger) auth.TokenManager {
	return &TokenManager{
		keyConf: keyConf{
			// NOTE: this parameter is the COST of the algorithm
			//	increase for security
			//  decrease for performance
			Cost: 65536,
			Len:  32,
		},
		cfg:    cfg,
		logger: logger,
	}
}

func (a *TokenManager) deriveKey(salt []byte) ([]byte, []byte, error) {
	if salt == nil {
		salt = make([]byte, 32)
		if _, err := rand.Read(salt); err != nil {
			return nil, nil, err
		}
	}

	key, err := scrypt.Key([]byte(a.cfg.Auth.ApiToken.CipherSecret), salt, a.keyConf.Cost, 8, 1, a.keyConf.Len)
	if err != nil {
		return nil, nil, err
	}

	return key, salt, nil
}

func (a *TokenManager) Encrypt(stringToEncrypt string) (string, error) {
	key, salt, err := a.deriveKey(nil)
	if err != nil {
		return "", fmt.Errorf("encrypt error: %w", err)
	}

	plaintext := []byte(stringToEncrypt)

	//Create a new Cipher Block from the key
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("encrypt error: %w", err)
	}

	//Create a new GCM
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("encrypt error: %w", err)
	}

	//Create a nonce
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("encrypt error: %w", err)
	}

	ciphertext := aesGCM.Seal(nonce, nonce, plaintext, nil)
	ciphertext = append(ciphertext, salt...)
	return fmt.Sprintf("%x", ciphertext), nil
}

func (a *TokenManager) Decrypt(encryptedString string) (string, error) {
	raw, _ := hex.DecodeString(encryptedString)
	salt, enc := raw[len(raw)-a.keyConf.Len:], raw[:len(raw)-a.keyConf.Len]
	key, _, err := a.deriveKey(salt)
	if err != nil {
		return "", fmt.Errorf("decrypt error: %w", err)
	}

	//Create a new Cipher Block from the key
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("decrypt error: %w", err)
	}

	//Create a new GCM
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("decrypt error: %w", err)
	}

	//Get the nonce size
	nonceSize := aesGCM.NonceSize()

	//Extract the nonce from the encrypted data
	nonce, ciphertext := enc[:nonceSize], enc[nonceSize:]

	//Decrypt the data
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("decrypt error: %w", err)
	}

	return fmt.Sprintf("%s", plaintext), nil
}
