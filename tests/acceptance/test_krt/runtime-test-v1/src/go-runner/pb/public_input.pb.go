// Code generated by protoc-gen-go. DO NOT EDIT.
// source: public_input.proto

package pb

import (
	fmt "fmt"
	proto "github.com/golang/protobuf/proto"
	math "math"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion3 // please upgrade the proto package

type Message struct {
	GoRunnerSuccess      bool     `protobuf:"varint,1,opt,name=go_runner_success,json=goRunnerSuccess,proto3" json:"go_runner_success,omitempty"`
	PyRunnerSuccess      bool     `protobuf:"varint,2,opt,name=py_runner_success,json=pyRunnerSuccess,proto3" json:"py_runner_success,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *Message) Reset()         { *m = Message{} }
func (m *Message) String() string { return proto.CompactTextString(m) }
func (*Message) ProtoMessage()    {}
func (*Message) Descriptor() ([]byte, []int) {
	return fileDescriptor_e09e0d69c728e82f, []int{0}
}

func (m *Message) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_Message.Unmarshal(m, b)
}
func (m *Message) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_Message.Marshal(b, m, deterministic)
}
func (m *Message) XXX_Merge(src proto.Message) {
	xxx_messageInfo_Message.Merge(m, src)
}
func (m *Message) XXX_Size() int {
	return xxx_messageInfo_Message.Size(m)
}
func (m *Message) XXX_DiscardUnknown() {
	xxx_messageInfo_Message.DiscardUnknown(m)
}

var xxx_messageInfo_Message proto.InternalMessageInfo

func (m *Message) GetGoRunnerSuccess() bool {
	if m != nil {
		return m.GoRunnerSuccess
	}
	return false
}

func (m *Message) GetPyRunnerSuccess() bool {
	if m != nil {
		return m.PyRunnerSuccess
	}
	return false
}

func init() {
	proto.RegisterType((*Message)(nil), "entrypoint.Message")
}

func init() {
	proto.RegisterFile("public_input.proto", fileDescriptor_e09e0d69c728e82f)
}

var fileDescriptor_e09e0d69c728e82f = []byte{
	// 166 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x09, 0x6e, 0x88, 0x02, 0xff, 0xe2, 0x12, 0x2a, 0x28, 0x4d, 0xca,
	0xc9, 0x4c, 0x8e, 0xcf, 0xcc, 0x2b, 0x28, 0x2d, 0xd1, 0x2b, 0x28, 0xca, 0x2f, 0xc9, 0x17, 0xe2,
	0x4a, 0xcd, 0x2b, 0x29, 0xaa, 0x2c, 0xc8, 0xcf, 0xcc, 0x2b, 0x51, 0x4a, 0xe4, 0x62, 0xf7, 0x4d,
	0x2d, 0x2e, 0x4e, 0x4c, 0x4f, 0x15, 0xd2, 0xe2, 0x12, 0x4c, 0xcf, 0x8f, 0x2f, 0x2a, 0xcd, 0xcb,
	0x4b, 0x2d, 0x8a, 0x2f, 0x2e, 0x4d, 0x4e, 0x06, 0x8a, 0x4b, 0x30, 0x2a, 0x30, 0x6a, 0x70, 0x04,
	0xf1, 0xa7, 0xe7, 0x07, 0x81, 0xc5, 0x83, 0x21, 0xc2, 0x20, 0xb5, 0x05, 0x95, 0xe8, 0x6a, 0x99,
	0x20, 0x6a, 0x0b, 0x2a, 0x51, 0xd4, 0x1a, 0x79, 0x70, 0x71, 0xb9, 0xc2, 0x2d, 0x14, 0xb2, 0xe2,
	0xe2, 0x09, 0xcf, 0x2f, 0xca, 0x4e, 0xcb, 0xc9, 0x2f, 0x0f, 0x49, 0x2d, 0x2e, 0x11, 0x12, 0xd6,
	0x43, 0xb8, 0x46, 0x0f, 0xea, 0x14, 0x29, 0x6c, 0x82, 0x4a, 0x0c, 0x4e, 0x6c, 0x51, 0x2c, 0x7a,
	0xd6, 0x05, 0x49, 0x49, 0x6c, 0x60, 0x7f, 0x18, 0x03, 0x02, 0x00, 0x00, 0xff, 0xff, 0xa6, 0xec,
	0x3a, 0x68, 0xdd, 0x00, 0x00, 0x00,
}
