package version

import "math/rand"

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
		b[i] = idCharset[rand.Intn(idCharsetLen)]
	}
	return string(b)
}
