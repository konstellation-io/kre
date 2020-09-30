package auth

//go:generate mockgen -source=${GOFILE} -destination=$PWD/mocks/auth_${GOFILE} -package=mocks

type TokenManager interface {
	Encrypt(stringToEncrypt string) (string, error)
	Decrypt(encryptedString string) (string, error)
}
