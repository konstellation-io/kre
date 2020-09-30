package auth

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase/logging"
	"io"
)

type CipherObject struct {
	cfg    *config.Config
	logger logging.Logger
}

func NewCipher(cfg *config.Config, logger logging.Logger) (auth.Cipher, error) {
	cipher := &CipherObject{
		cfg:    cfg,
		logger: logger,
	}
	return cipher, nil
}

func (a *CipherObject) Encrypt(stringToEncrypt string) (string, error) {

	key := []byte(a.cfg.Auth.ApiToken.CipherSecret)

	plaintext := []byte(stringToEncrypt)

	//Create a new Cipher Block from the key
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("error creating new aes cipher: %w", err)
	}

	//Create a new GCM
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("error creating new aes block: %w", err)
	}

	//Create a nonce
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("error creating nonce cipher param: %w", err)
	}

	ciphertext := aesGCM.Seal(nonce, nonce, plaintext, nil)
	return fmt.Sprintf("%x", ciphertext), nil
}

func (a *CipherObject) Decrypt(encryptedString string) (string, error) {

	key := []byte(a.cfg.Auth.ApiToken.CipherSecret)
	enc, _ := hex.DecodeString(encryptedString)

	//Create a new Cipher Block from the key
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("error creating new aes cipher: %w", err)
	}

	//Create a new GCM
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("error creating new aes block: %w", err)
	}

	//Get the nonce size
	nonceSize := aesGCM.NonceSize()

	//Extract the nonce from the encrypted data
	nonce, ciphertext := enc[:nonceSize], enc[nonceSize:]

	//Decrypt the data
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("error decripting aes block: %w", err)
	}

	return fmt.Sprintf("%s", plaintext), nil
}
