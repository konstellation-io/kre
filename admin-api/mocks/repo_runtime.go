// Code generated by MockGen. DO NOT EDIT.
// Source: runtime.go

// Package mocks is a generated GoMock package.
package mocks

import (
	gomock "github.com/golang/mock/gomock"
	entity "gitlab.com/konstellation/kre/admin-api/domain/entity"
	reflect "reflect"
)

// MockRuntimeRepo is a mock of RuntimeRepo interface
type MockRuntimeRepo struct {
	ctrl     *gomock.Controller
	recorder *MockRuntimeRepoMockRecorder
}

// MockRuntimeRepoMockRecorder is the mock recorder for MockRuntimeRepo
type MockRuntimeRepoMockRecorder struct {
	mock *MockRuntimeRepo
}

// NewMockRuntimeRepo creates a new mock instance
func NewMockRuntimeRepo(ctrl *gomock.Controller) *MockRuntimeRepo {
	mock := &MockRuntimeRepo{ctrl: ctrl}
	mock.recorder = &MockRuntimeRepoMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use
func (m *MockRuntimeRepo) EXPECT() *MockRuntimeRepoMockRecorder {
	return m.recorder
}

// Create mocks base method
func (m *MockRuntimeRepo) Create(arg0 *entity.Runtime) (*entity.Runtime, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Create", arg0)
	ret0, _ := ret[0].(*entity.Runtime)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Create indicates an expected call of Create
func (mr *MockRuntimeRepoMockRecorder) Create(arg0 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Create", reflect.TypeOf((*MockRuntimeRepo)(nil).Create), arg0)
}

// Update mocks base method
func (m *MockRuntimeRepo) Update(arg0 *entity.Runtime) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Update", arg0)
	ret0, _ := ret[0].(error)
	return ret0
}

// Update indicates an expected call of Update
func (mr *MockRuntimeRepoMockRecorder) Update(arg0 interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Update", reflect.TypeOf((*MockRuntimeRepo)(nil).Update), arg0)
}

// FindAll mocks base method
func (m *MockRuntimeRepo) FindAll() ([]*entity.Runtime, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "FindAll")
	ret0, _ := ret[0].([]*entity.Runtime)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// FindAll indicates an expected call of FindAll
func (mr *MockRuntimeRepoMockRecorder) FindAll() *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "FindAll", reflect.TypeOf((*MockRuntimeRepo)(nil).FindAll))
}

// GetByID mocks base method
func (m *MockRuntimeRepo) GetByID(runtimeID string) (*entity.Runtime, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetByID", runtimeID)
	ret0, _ := ret[0].(*entity.Runtime)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetByID indicates an expected call of GetByID
func (mr *MockRuntimeRepoMockRecorder) GetByID(runtimeID interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetByID", reflect.TypeOf((*MockRuntimeRepo)(nil).GetByID), runtimeID)
}