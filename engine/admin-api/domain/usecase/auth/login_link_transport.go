package auth

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/auth_${GOFILE} -package=mocks

type LoginLinkTransport interface {
	Send(recipient, verificationCode string) error
}
