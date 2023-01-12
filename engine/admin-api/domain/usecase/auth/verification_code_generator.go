package auth

//go:generate mockgen -source=${GOFILE} -destination=../../../mocks/auth_${GOFILE} -package=mocks

type VerificationCodeGenerator interface {
	Generate() string
}
