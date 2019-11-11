package auth

type TokenTransport interface {
	Send(recipient, subject, message string) error
}
