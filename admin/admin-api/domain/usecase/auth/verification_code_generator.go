package auth

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/auth_${GOFILE} -package=mocks

type VerificationCodeGenerator interface {
	Generate() string
}
