// Code generated by MockGen. DO NOT EDIT.
// Source: user.go

// Package mocks is a generated GoMock package.
package mocks

import (
	context "context"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
	entity "github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

// MockUserRepo is a mock of UserRepo interface.
type MockUserRepo struct {
	ctrl     *gomock.Controller
	recorder *MockUserRepoMockRecorder
}

// MockUserRepoMockRecorder is the mock recorder for MockUserRepo.
type MockUserRepoMockRecorder struct {
	mock *MockUserRepo
}

// NewMockUserRepo creates a new mock instance.
func NewMockUserRepo(ctrl *gomock.Controller) *MockUserRepo {
	mock := &MockUserRepo{ctrl: ctrl}
	mock.recorder = &MockUserRepoMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockUserRepo) EXPECT() *MockUserRepoMockRecorder {
	return m.recorder
}

// Create mocks base method.
func (m *MockUserRepo) Create(ctx context.Context, email string, accessLevel entity.AccessLevel) (*entity.User, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Create", ctx, email, accessLevel)
	ret0, _ := ret[0].(*entity.User)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Create indicates an expected call of Create.
func (mr *MockUserRepoMockRecorder) Create(ctx, email, accessLevel interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Create", reflect.TypeOf((*MockUserRepo)(nil).Create), ctx, email, accessLevel)
}

// GetAll mocks base method.
func (m *MockUserRepo) GetAll(ctx context.Context, returnDeleted bool) ([]*entity.User, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetAll", ctx, returnDeleted)
	ret0, _ := ret[0].([]*entity.User)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetAll indicates an expected call of GetAll.
func (mr *MockUserRepoMockRecorder) GetAll(ctx, returnDeleted interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetAll", reflect.TypeOf((*MockUserRepo)(nil).GetAll), ctx, returnDeleted)
}

// GetByAccessLevel mocks base method.
func (m *MockUserRepo) GetByAccessLevel(ctx context.Context, accessLevel entity.AccessLevel) ([]*entity.User, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetByAccessLevel", ctx, accessLevel)
	ret0, _ := ret[0].([]*entity.User)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetByAccessLevel indicates an expected call of GetByAccessLevel.
func (mr *MockUserRepoMockRecorder) GetByAccessLevel(ctx, accessLevel interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetByAccessLevel", reflect.TypeOf((*MockUserRepo)(nil).GetByAccessLevel), ctx, accessLevel)
}

// GetByEmail mocks base method.
func (m *MockUserRepo) GetByEmail(email string) (*entity.User, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetByEmail", email)
	ret0, _ := ret[0].(*entity.User)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetByEmail indicates an expected call of GetByEmail.
func (mr *MockUserRepoMockRecorder) GetByEmail(email interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetByEmail", reflect.TypeOf((*MockUserRepo)(nil).GetByEmail), email)
}

// GetByID mocks base method.
func (m *MockUserRepo) GetByID(userID string) (*entity.User, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetByID", userID)
	ret0, _ := ret[0].(*entity.User)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetByID indicates an expected call of GetByID.
func (mr *MockUserRepoMockRecorder) GetByID(userID interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetByID", reflect.TypeOf((*MockUserRepo)(nil).GetByID), userID)
}

// GetByIDs mocks base method.
func (m *MockUserRepo) GetByIDs(keys []string) ([]*entity.User, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetByIDs", keys)
	ret0, _ := ret[0].([]*entity.User)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetByIDs indicates an expected call of GetByIDs.
func (mr *MockUserRepoMockRecorder) GetByIDs(keys interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetByIDs", reflect.TypeOf((*MockUserRepo)(nil).GetByIDs), keys)
}

// GetManyByEmail mocks base method.
func (m *MockUserRepo) GetManyByEmail(ctx context.Context, email string) ([]*entity.User, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "GetManyByEmail", ctx, email)
	ret0, _ := ret[0].([]*entity.User)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// GetManyByEmail indicates an expected call of GetManyByEmail.
func (mr *MockUserRepoMockRecorder) GetManyByEmail(ctx, email interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "GetManyByEmail", reflect.TypeOf((*MockUserRepo)(nil).GetManyByEmail), ctx, email)
}

// MarkAsDeleted mocks base method.
func (m *MockUserRepo) MarkAsDeleted(ctx context.Context, userIDs []string) ([]*entity.User, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "MarkAsDeleted", ctx, userIDs)
	ret0, _ := ret[0].([]*entity.User)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// MarkAsDeleted indicates an expected call of MarkAsDeleted.
func (mr *MockUserRepoMockRecorder) MarkAsDeleted(ctx, userIDs interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "MarkAsDeleted", reflect.TypeOf((*MockUserRepo)(nil).MarkAsDeleted), ctx, userIDs)
}

// UpdateAccessLevel mocks base method.
func (m *MockUserRepo) UpdateAccessLevel(ctx context.Context, userIDs []string, accessLevel entity.AccessLevel) ([]*entity.User, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "UpdateAccessLevel", ctx, userIDs, accessLevel)
	ret0, _ := ret[0].([]*entity.User)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// UpdateAccessLevel indicates an expected call of UpdateAccessLevel.
func (mr *MockUserRepoMockRecorder) UpdateAccessLevel(ctx, userIDs, accessLevel interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "UpdateAccessLevel", reflect.TypeOf((*MockUserRepo)(nil).UpdateAccessLevel), ctx, userIDs, accessLevel)
}

// UpdateLastActivity mocks base method.
func (m *MockUserRepo) UpdateLastActivity(userID string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "UpdateLastActivity", userID)
	ret0, _ := ret[0].(error)
	return ret0
}

// UpdateLastActivity indicates an expected call of UpdateLastActivity.
func (mr *MockUserRepoMockRecorder) UpdateLastActivity(userID interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "UpdateLastActivity", reflect.TypeOf((*MockUserRepo)(nil).UpdateLastActivity), userID)
}
