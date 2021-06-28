package compression

import (
	"bytes"
	"compress/gzip"
	"io/ioutil"
)

const (
	gzipID1 = 0x1f
	gzipID2 = 0x8b
)

// isCompressed checks if the input string is compressed.
func IsCompressed(data []byte) bool {
	return data[0] == gzipID1 && data[1] == gzipID2
}

// uncompress opens gzip and return uncompressed []byte.
func Uncompress(data []byte) ([]byte, error) {
	rd := bytes.NewReader(data)

	gr, err := gzip.NewReader(rd)
	if err != nil {
		return nil, err
	}

	defer gr.Close()

	return ioutil.ReadAll(gr)
}
