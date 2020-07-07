package runtime

import (
	"math/rand"
	"strings"
	"time"
)

const passwordLength = 8

type PasswordGenerator struct {
}

func NewPasswordGenerator() *PasswordGenerator {
	return &PasswordGenerator{}
}

func (p *PasswordGenerator) NewPassword() string {
	rand.Seed(time.Now().UnixNano())
	chars := []rune("ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
		"abcdefghijklmnopqrstuvwxyz" +
		"0123456789")
	var b strings.Builder
	for i := 0; i < passwordLength; i++ {
		b.WriteRune(chars[rand.Intn(len(chars))])
	}
	return b.String()
}
