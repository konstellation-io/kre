package compression

import (
	"bytes"
	"compress/gzip"
	"io"
)

const (
	gzipID1 = 0x1f
	gzipID2 = 0x8b
)

// IsCompressed checks if the input string is compressed.
func IsCompressed(data []byte) bool {
	return data[0] == gzipID1 && data[1] == gzipID2
}

// Uncompress opens gzip and return uncompressed []byte.
func Uncompress(data []byte) ([]byte, error) {
	rd := bytes.NewReader(data)

	gr, err := gzip.NewReader(rd)
	if err != nil {
		return nil, err
	}

	defer gr.Close()

	return io.ReadAll(gr)
}
