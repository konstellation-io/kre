# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: public_input.proto

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import reflection as _reflection
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor.FileDescriptor(
  name='public_input.proto',
  package='entrypoint',
  syntax='proto3',
  serialized_options=b'Z\004.;pb',
  serialized_pb=b'\n\x12public_input.proto\x12\nentrypoint\"?\n\x07Message\x12\x19\n\x11go_runner_success\x18\x01 \x01(\x08\x12\x19\n\x11py_runner_success\x18\x02 \x01(\x08\x32H\n\nEntrypoint\x12:\n\x0cWorkflowTest\x12\x13.entrypoint.Message\x1a\x13.entrypoint.Message\"\x00\x42\x06Z\x04.;pbb\x06proto3'
)




_MESSAGE = _descriptor.Descriptor(
  name='Message',
  full_name='entrypoint.Message',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    _descriptor.FieldDescriptor(
      name='go_runner_success', full_name='entrypoint.Message.go_runner_success', index=0,
      number=1, type=8, cpp_type=7, label=1,
      has_default_value=False, default_value=False,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
    _descriptor.FieldDescriptor(
      name='py_runner_success', full_name='entrypoint.Message.py_runner_success', index=1,
      number=2, type=8, cpp_type=7, label=1,
      has_default_value=False, default_value=False,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      serialized_options=None, file=DESCRIPTOR),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  serialized_options=None,
  is_extendable=False,
  syntax='proto3',
  extension_ranges=[],
  oneofs=[
  ],
  serialized_start=34,
  serialized_end=97,
)

DESCRIPTOR.message_types_by_name['Message'] = _MESSAGE
_sym_db.RegisterFileDescriptor(DESCRIPTOR)

Message = _reflection.GeneratedProtocolMessageType('Message', (_message.Message,), {
  'DESCRIPTOR' : _MESSAGE,
  '__module__' : 'public_input_pb2'
  # @@protoc_insertion_point(class_scope:entrypoint.Message)
  })
_sym_db.RegisterMessage(Message)


DESCRIPTOR._options = None

_ENTRYPOINT = _descriptor.ServiceDescriptor(
  name='Entrypoint',
  full_name='entrypoint.Entrypoint',
  file=DESCRIPTOR,
  index=0,
  serialized_options=None,
  serialized_start=99,
  serialized_end=171,
  methods=[
  _descriptor.MethodDescriptor(
    name='WorkflowTest',
    full_name='entrypoint.Entrypoint.WorkflowTest',
    index=0,
    containing_service=None,
    input_type=_MESSAGE,
    output_type=_MESSAGE,
    serialized_options=None,
  ),
])
_sym_db.RegisterServiceDescriptor(_ENTRYPOINT)

DESCRIPTOR.services_by_name['Entrypoint'] = _ENTRYPOINT

# @@protoc_insertion_point(module_scope)
