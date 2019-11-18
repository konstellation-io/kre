package auth

type VerificationCodeGenerator interface {
	Generate() string
}
