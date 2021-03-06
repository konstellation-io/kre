// Code generated by MockGen. DO NOT EDIT.
// Source: metrics_dashboards.go

// Package mocks is a generated GoMock package.
package mocks

import (
	context "context"
	gomock "github.com/golang/mock/gomock"
	reflect "reflect"
)

// MockDashboardService is a mock of DashboardService interface
type MockDashboardService struct {
	ctrl     *gomock.Controller
	recorder *MockDashboardServiceMockRecorder
}

// MockDashboardServiceMockRecorder is the mock recorder for MockDashboardService
type MockDashboardServiceMockRecorder struct {
	mock *MockDashboardService
}

// NewMockDashboardService creates a new mock instance
func NewMockDashboardService(ctrl *gomock.Controller) *MockDashboardService {
	mock := &MockDashboardService{ctrl: ctrl}
	mock.recorder = &MockDashboardServiceMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use
func (m *MockDashboardService) EXPECT() *MockDashboardServiceMockRecorder {
	return m.recorder
}

// Create mocks base method
func (m *MockDashboardService) Create(ctx context.Context, version, dashboardPath string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Create", ctx, version, dashboardPath)
	ret0, _ := ret[0].(error)
	return ret0
}

// Create indicates an expected call of Create
func (mr *MockDashboardServiceMockRecorder) Create(ctx, version, dashboardPath interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Create", reflect.TypeOf((*MockDashboardService)(nil).Create), ctx, version, dashboardPath)
}
