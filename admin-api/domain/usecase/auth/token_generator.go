package auth

type TokenGenerator interface {
	// Generate should return a token and nil error on success, or an empty
	// string and error on failure.
	Generate() (string, error)
}
