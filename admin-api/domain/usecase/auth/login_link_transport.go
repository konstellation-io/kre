package auth

type LoginLinkTransport interface {
	Send(recipient, verificationCode string) error
}
