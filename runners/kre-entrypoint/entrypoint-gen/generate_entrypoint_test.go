package main

import (
	"bytes"
	"io/ioutil"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_generateEntrypoint(t *testing.T) {
	input := strings.NewReader(`
syntax = "proto3";

package entrypoint;

message Request {
  string test = 1;
}

message Response {
  string test = 1;
}

service Entrypoint {
  rpc Test (Request) returns (Response) {};
};
`)

	out := bytes.NewBufferString("")

	err := generateEntrypoint(input, out)
	assert.NoError(t, err)
	actual, err := ioutil.ReadAll(out)
	assert.NoError(t, err)

	expected := `from grpclib.server import Stream

from kre_grpc import EntrypointKRE

from public_input_grpc import EntrypointBase
import public_input_pb2

class Entrypoint(EntrypointBase, EntrypointKRE):
    def __init__(self, logger, nc, subjects, config):
        logger.info(f"Entrypoint for '{config.krt_version}' initialized. ")
        EntrypointKRE.__init__(self, logger, nc, subjects, config)

    
    async def Test(self, stream: Stream[public_input_pb2.Request, public_input_pb2.Response]) -> None:
        return await self.process_message(stream, "Test")
    

    def make_response_object(self, subject, kre_nats_msg):
        if subject == 'Test':
            self.logger.info(f"call to Test(Request)"
                             f" responses with 'Response'. Data: {kre_nats_msg.data}")

            if kre_nats_msg.error:
                return public_input_pb2.Response(error=kre_nats_msg.error)
            else:
                return public_input_pb2.Response(**kre_nats_msg.data)
        
        raise Exception(f"unable to create a response from unknown subject '{subject}' ")
`
	assert.Equal(t, expected, string(actual))
}
