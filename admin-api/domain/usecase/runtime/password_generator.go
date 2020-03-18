package runtime

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/runtime_${GOFILE} -package=mocks

type PasswordGenerator interface {
	NewPassword() string
}
