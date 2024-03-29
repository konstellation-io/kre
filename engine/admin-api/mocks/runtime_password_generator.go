// Code generated by MockGen. DO NOT EDIT.
// Source: password_generator.go

// Package mocks is a generated GoMock package.
package mocks

import (
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
)

// MockPasswordGenerator is a mock of PasswordGenerator interface.
type MockPasswordGenerator struct {
	ctrl     *gomock.Controller
	recorder *MockPasswordGeneratorMockRecorder
}

// MockPasswordGeneratorMockRecorder is the mock recorder for MockPasswordGenerator.
type MockPasswordGeneratorMockRecorder struct {
	mock *MockPasswordGenerator
}

// NewMockPasswordGenerator creates a new mock instance.
func NewMockPasswordGenerator(ctrl *gomock.Controller) *MockPasswordGenerator {
	mock := &MockPasswordGenerator{ctrl: ctrl}
	mock.recorder = &MockPasswordGeneratorMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockPasswordGenerator) EXPECT() *MockPasswordGeneratorMockRecorder {
	return m.recorder
}

// NewPassword mocks base method.
func (m *MockPasswordGenerator) NewPassword() string {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "NewPassword")
	ret0, _ := ret[0].(string)
	return ret0
}

// NewPassword indicates an expected call of NewPassword.
func (mr *MockPasswordGeneratorMockRecorder) NewPassword() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "NewPassword", reflect.TypeOf((*MockPasswordGenerator)(nil).NewPassword))
}
