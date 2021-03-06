// Code generated by MockGen. DO NOT EDIT.
// Source: nodelog.go

// Package mocks is a generated GoMock package.
package mocks

import (
	context "context"
	gomock "github.com/golang/mock/gomock"
	entity "github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	reflect "reflect"
)

// MockNodeLogRepository is a mock of NodeLogRepository interface
type MockNodeLogRepository struct {
	ctrl     *gomock.Controller
	recorder *MockNodeLogRepositoryMockRecorder
}

// MockNodeLogRepositoryMockRecorder is the mock recorder for MockNodeLogRepository
type MockNodeLogRepositoryMockRecorder struct {
	mock *MockNodeLogRepository
}

// NewMockNodeLogRepository creates a new mock instance
func NewMockNodeLogRepository(ctrl *gomock.Controller) *MockNodeLogRepository {
	mock := &MockNodeLogRepository{ctrl: ctrl}
	mock.recorder = &MockNodeLogRepositoryMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use
func (m *MockNodeLogRepository) EXPECT() *MockNodeLogRepositoryMockRecorder {
	return m.recorder
}

// WatchNodeLogs mocks base method
func (m *MockNodeLogRepository) WatchNodeLogs(ctx context.Context, versionName string, filters entity.LogFilters) (<-chan *entity.NodeLog, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "WatchNodeLogs", ctx, versionName, filters)
	ret0, _ := ret[0].(<-chan *entity.NodeLog)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// WatchNodeLogs indicates an expected call of WatchNodeLogs
func (mr *MockNodeLogRepositoryMockRecorder) WatchNodeLogs(ctx, versionName, filters interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "WatchNodeLogs", reflect.TypeOf((*MockNodeLogRepository)(nil).WatchNodeLogs), ctx, versionName, filters)
}

// PaginatedSearch mocks base method
func (m *MockNodeLogRepository) PaginatedSearch(ctx context.Context, searchOpts *entity.SearchLogsOptions) (*entity.SearchLogsResult, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "PaginatedSearch", ctx, searchOpts)
	ret0, _ := ret[0].(*entity.SearchLogsResult)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// PaginatedSearch indicates an expected call of PaginatedSearch
func (mr *MockNodeLogRepositoryMockRecorder) PaginatedSearch(ctx, searchOpts interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "PaginatedSearch", reflect.TypeOf((*MockNodeLogRepository)(nil).PaginatedSearch), ctx, searchOpts)
}
