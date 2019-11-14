package auth

import (
	"crypto/rand"
	"errors"
)

// ByteGenerator generates random sequences of bytes from the specified set
// of the specified length.
type ByteGenerator struct {
	Bytes  []byte
	Length int
}

// NewByteGenerator creates and returns a ByteGenerator.
func NewByteTokenGenerator() *ByteGenerator {
	b := []byte("ABCDEFGHIJKLMNOPQRSTUVWYZabcdefghijklmnopqrstuvwyz1234567890")
	l := 20
	return &ByteGenerator{
		Bytes:  b,
		Length: l,
	}
}

// Generate returns a string generated from random bytes of the configured
// set, of the given length. An error may be returned if there is insufficient
// entropy to generate a result.
func (g ByteGenerator) Generate() (string, error) {
	if b, err := randBytes(g.Bytes, g.Length); err != nil {
		return "", err
	} else {
		return string(b), nil
	}
}

// randBytes returns a random array of bytes picked from `p` of length `n`.
func randBytes(p []byte, n int) ([]byte, error) {
	if len(p) > 256 {
		return nil, errors.New("randBytes requires a pool of <= 256 items")
	}
	c := len(p)
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return nil, err
	}
	// Pick items randomly out of `p`. Because it's possible that
	// `len(p) < size(byte)`, use remainder in next iteration to ensure all
	// bytes have an equal chance of being selected.
	j := 0 // reservoir
	for i := 0; i < n; i++ {
		bb := int(b[i])
		b[i] = p[(j+bb)%c]
		j += (c + (c-bb)%c) % c
	}
	return b, nil
}
