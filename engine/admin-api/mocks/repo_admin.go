// Code generated by MockGen. DO NOT EDIT.
// Source: admin.go

// Package mocks is a generated GoMock package.
package mocks

import (
	context "context"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
)

// MockAdminRepo is a mock of AdminRepo interface.
type MockAdminRepo struct {
	ctrl     *gomock.Controller
	recorder *MockAdminRepoMockRecorder
}

// MockAdminRepoMockRecorder is the mock recorder for MockAdminRepo.
type MockAdminRepoMockRecorder struct {
	mock *MockAdminRepo
}

// NewMockAdminRepo creates a new mock instance.
func NewMockAdminRepo(ctrl *gomock.Controller) *MockAdminRepo {
	mock := &MockAdminRepo{ctrl: ctrl}
	mock.recorder = &MockAdminRepoMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockAdminRepo) EXPECT() *MockAdminRepoMockRecorder {
	return m.recorder
}

// GrantReadPermission mocks base method.
func (m *MockAdminRepo) GrantReadPermission(ctx context.Context, runtimeDataDB string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GrantReadPermission", ctx, runtimeDataDB)
	ret0, _ := ret[0].(error)
	return ret0
}

// GrantReadPermission indicates an expected call of GrantReadPermission.
func (mr *MockAdminRepoMockRecorder) GrantReadPermission(ctx, runtimeDataDB interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GrantReadPermission", reflect.TypeOf((*MockAdminRepo)(nil).GrantReadPermission), ctx, runtimeDataDB)
}