package auth

import (
	"github.com/google/uuid"
)

type UUIDVerificationCodeGenerator struct{}

func NewUUIDVerificationCodeGenerator() *UUIDVerificationCodeGenerator {
	return &UUIDVerificationCodeGenerator{}
}

func (g *UUIDVerificationCodeGenerator) Generate() string {
	return uuid.New().String()
}
