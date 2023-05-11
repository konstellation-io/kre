package runtime

import (
	"crypto/rand"
	"math/big"
	"strings"
)

const passwordLength = 8

type PasswordGenerator struct {
}

func NewPasswordGenerator() *PasswordGenerator {
	return &PasswordGenerator{}
}

func (p *PasswordGenerator) NewPassword() string {
	chars := []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
		"abcdefghijklmnopqrstuvwxyz" +
		"0123456789")

	var b strings.Builder

	for i := 0; i < passwordLength; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		if err != nil {
			return ""
		}

		b.WriteRune(chars[num.Int64()])
	}

	return b.String()
}
