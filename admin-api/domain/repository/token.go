package repository

import "time"

type TokenRepo interface {
	// Store securely stores the given token with the given expiry time.
	Store(token, uid string, ttl time.Duration) error

	// Exists returns true if a token is stored for the user. If the expiry
	// time is available this is also returned, otherwise it will be zero
	// and can be tested with `Time.IsZero()`.
	// Exists(uid string) (bool, time.Time, error)

	// Verify returns true if the given token is valid for the user.
	//Verify(token, uid string) (bool, error)

	// Delete removes the token for the specified  user.
	//Delete(uid string) error
}
