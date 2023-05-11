package version

import (
	"crypto/rand"
	"math/big"
)

const idLength = 5
const idCharset = "abcdefghijklmnopqrstuvwxyz"
const idCharsetLen = len(idCharset)

type IDGenerator struct {
}

func NewIDGenerator() IDGenerator {
	return IDGenerator{}
}

func (g IDGenerator) NewID() string {
	b := make([]byte, idLength)
	for i := range b {
		bigInt, err := rand.Int(rand.Reader, big.NewInt(int64(idCharsetLen)))
		if err != nil {
			panic(err)
		}

		b[i] = idCharset[bigInt.Int64()]
	}

	return string(b)
}
