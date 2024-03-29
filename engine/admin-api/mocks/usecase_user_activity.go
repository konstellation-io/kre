// Code generated by MockGen. DO NOT EDIT.
// Source: user_activity.go

// Package mocks is a generated GoMock package.
package mocks

import (
	context "context"
	reflect "reflect"

	gomock "github.com/golang/mock/gomock"
	entity "github.com/konstellation-io/kre/engine/admin-api/domain/entity"
)

// MockUserActivityInteracter is a mock of UserActivityInteracter interface.
type MockUserActivityInteracter struct {
	ctrl     *gomock.Controller
	recorder *MockUserActivityInteracterMockRecorder
}

// MockUserActivityInteracterMockRecorder is the mock recorder for MockUserActivityInteracter.
type MockUserActivityInteracterMockRecorder struct {
	mock *MockUserActivityInteracter
}

// NewMockUserActivityInteracter creates a new mock instance.
func NewMockUserActivityInteracter(ctrl *gomock.Controller) *MockUserActivityInteracter {
	mock := &MockUserActivityInteracter{ctrl: ctrl}
	mock.recorder = &MockUserActivityInteracterMockRecorder{mock}
	return mock
}

// EXPECT returns an object that allows the caller to indicate expected use.
func (m *MockUserActivityInteracter) EXPECT() *MockUserActivityInteracterMockRecorder {
	return m.recorder
}

// Get mocks base method.
func (m *MockUserActivityInteracter) Get(ctx context.Context, loggedUserID string, userEmail *string, types []entity.UserActivityType, versionIds []string, fromDate, toDate, lastID *string) ([]*entity.UserActivity, error) {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "Get", ctx, loggedUserID, userEmail, types, versionIds, fromDate, toDate, lastID)
	ret0, _ := ret[0].([]*entity.UserActivity)
	ret1, _ := ret[1].(error)
	return ret0, ret1
}

// Get indicates an expected call of Get.
func (mr *MockUserActivityInteracterMockRecorder) Get(ctx, loggedUserID, userEmail, types, versionIds, fromDate, toDate, lastID interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "Get", reflect.TypeOf((*MockUserActivityInteracter)(nil).Get), ctx, loggedUserID, userEmail, types, versionIds, fromDate, toDate, lastID)
}

// NewUpdateSettingVars mocks base method.
func (m *MockUserActivityInteracter) NewUpdateSettingVars(settingName, oldValue, newValue string) []*entity.UserActivityVar {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "NewUpdateSettingVars", settingName, oldValue, newValue)
	ret0, _ := ret[0].([]*entity.UserActivityVar)
	return ret0
}

// NewUpdateSettingVars indicates an expected call of NewUpdateSettingVars.
func (mr *MockUserActivityInteracterMockRecorder) NewUpdateSettingVars(settingName, oldValue, newValue interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "NewUpdateSettingVars", reflect.TypeOf((*MockUserActivityInteracter)(nil).NewUpdateSettingVars), settingName, oldValue, newValue)
}

// RegisterCreateAction mocks base method.
func (m *MockUserActivityInteracter) RegisterCreateAction(userID, runtimeId string, version *entity.Version) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RegisterCreateAction", userID, runtimeId, version)
	ret0, _ := ret[0].(error)
	return ret0
}

// RegisterCreateAction indicates an expected call of RegisterCreateAction.
func (mr *MockUserActivityInteracterMockRecorder) RegisterCreateAction(userID, runtimeId, version interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterCreateAction", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterCreateAction), userID, runtimeId, version)
}

// RegisterCreateRuntime mocks base method.
func (m *MockUserActivityInteracter) RegisterCreateRuntime(userID string, runtime *entity.Runtime) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RegisterCreateRuntime", userID, runtime)
	ret0, _ := ret[0].(error)
	return ret0
}

// RegisterCreateRuntime indicates an expected call of RegisterCreateRuntime.
func (mr *MockUserActivityInteracterMockRecorder) RegisterCreateRuntime(userID, runtime interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterCreateRuntime", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterCreateRuntime), userID, runtime)
}

// RegisterCreateUser mocks base method.
func (m *MockUserActivityInteracter) RegisterCreateUser(userID string, createdUser *entity.User) {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "RegisterCreateUser", userID, createdUser)
}

// RegisterCreateUser indicates an expected call of RegisterCreateUser.
func (mr *MockUserActivityInteracterMockRecorder) RegisterCreateUser(userID, createdUser interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterCreateUser", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterCreateUser), userID, createdUser)
}

// RegisterDeleteAPIToken mocks base method.
func (m *MockUserActivityInteracter) RegisterDeleteAPIToken(userID, apiTokenName string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RegisterDeleteAPIToken", userID, apiTokenName)
	ret0, _ := ret[0].(error)
	return ret0
}

// RegisterDeleteAPIToken indicates an expected call of RegisterDeleteAPIToken.
func (mr *MockUserActivityInteracterMockRecorder) RegisterDeleteAPIToken(userID, apiTokenName interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterDeleteAPIToken", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterDeleteAPIToken), userID, apiTokenName)
}

// RegisterGenerateAPIToken mocks base method.
func (m *MockUserActivityInteracter) RegisterGenerateAPIToken(userID, apiTokenName string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RegisterGenerateAPIToken", userID, apiTokenName)
	ret0, _ := ret[0].(error)
	return ret0
}

// RegisterGenerateAPIToken indicates an expected call of RegisterGenerateAPIToken.
func (mr *MockUserActivityInteracterMockRecorder) RegisterGenerateAPIToken(userID, apiTokenName interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterGenerateAPIToken", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterGenerateAPIToken), userID, apiTokenName)
}

// RegisterLogin mocks base method.
func (m *MockUserActivityInteracter) RegisterLogin(userID string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RegisterLogin", userID)
	ret0, _ := ret[0].(error)
	return ret0
}

// RegisterLogin indicates an expected call of RegisterLogin.
func (mr *MockUserActivityInteracterMockRecorder) RegisterLogin(userID interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterLogin", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterLogin), userID)
}

// RegisterLogout mocks base method.
func (m *MockUserActivityInteracter) RegisterLogout(userID string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RegisterLogout", userID)
	ret0, _ := ret[0].(error)
	return ret0
}

// RegisterLogout indicates an expected call of RegisterLogout.
func (mr *MockUserActivityInteracterMockRecorder) RegisterLogout(userID interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterLogout", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterLogout), userID)
}

// RegisterPublishAction mocks base method.
func (m *MockUserActivityInteracter) RegisterPublishAction(userID, runtimeId string, version, prev *entity.Version, comment string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RegisterPublishAction", userID, runtimeId, version, prev, comment)
	ret0, _ := ret[0].(error)
	return ret0
}

// RegisterPublishAction indicates an expected call of RegisterPublishAction.
func (mr *MockUserActivityInteracterMockRecorder) RegisterPublishAction(userID, runtimeId, version, prev, comment interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterPublishAction", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterPublishAction), userID, runtimeId, version, prev, comment)
}

// RegisterRemoveUsers mocks base method.
func (m *MockUserActivityInteracter) RegisterRemoveUsers(userID string, userIDs, userEmails []string, comment string) {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "RegisterRemoveUsers", userID, userIDs, userEmails, comment)
}

// RegisterRemoveUsers indicates an expected call of RegisterRemoveUsers.
func (mr *MockUserActivityInteracterMockRecorder) RegisterRemoveUsers(userID, userIDs, userEmails, comment interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterRemoveUsers", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterRemoveUsers), userID, userIDs, userEmails, comment)
}

// RegisterRevokeSessions mocks base method.
func (m *MockUserActivityInteracter) RegisterRevokeSessions(userID string, userIDs, userEmails []string, comment string) {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "RegisterRevokeSessions", userID, userIDs, userEmails, comment)
}

// RegisterRevokeSessions indicates an expected call of RegisterRevokeSessions.
func (mr *MockUserActivityInteracterMockRecorder) RegisterRevokeSessions(userID, userIDs, userEmails, comment interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterRevokeSessions", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterRevokeSessions), userID, userIDs, userEmails, comment)
}

// RegisterStartAction mocks base method.
func (m *MockUserActivityInteracter) RegisterStartAction(userID, runtimeId string, version *entity.Version, comment string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RegisterStartAction", userID, runtimeId, version, comment)
	ret0, _ := ret[0].(error)
	return ret0
}

// RegisterStartAction indicates an expected call of RegisterStartAction.
func (mr *MockUserActivityInteracterMockRecorder) RegisterStartAction(userID, runtimeId, version, comment interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterStartAction", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterStartAction), userID, runtimeId, version, comment)
}

// RegisterStopAction mocks base method.
func (m *MockUserActivityInteracter) RegisterStopAction(userID, runtimeId string, version *entity.Version, comment string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RegisterStopAction", userID, runtimeId, version, comment)
	ret0, _ := ret[0].(error)
	return ret0
}

// RegisterStopAction indicates an expected call of RegisterStopAction.
func (mr *MockUserActivityInteracterMockRecorder) RegisterStopAction(userID, runtimeId, version, comment interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterStopAction", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterStopAction), userID, runtimeId, version, comment)
}

// RegisterUnpublishAction mocks base method.
func (m *MockUserActivityInteracter) RegisterUnpublishAction(userID, runtimeId string, version *entity.Version, comment string) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RegisterUnpublishAction", userID, runtimeId, version, comment)
	ret0, _ := ret[0].(error)
	return ret0
}

// RegisterUnpublishAction indicates an expected call of RegisterUnpublishAction.
func (mr *MockUserActivityInteracterMockRecorder) RegisterUnpublishAction(userID, runtimeId, version, comment interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterUnpublishAction", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterUnpublishAction), userID, runtimeId, version, comment)
}

// RegisterUpdateAccessLevels mocks base method.
func (m *MockUserActivityInteracter) RegisterUpdateAccessLevels(userID string, userIDs, userEmails []string, newAccessLevel entity.AccessLevel, comment string) {
	m.ctrl.T.Helper()
	m.ctrl.Call(m, "RegisterUpdateAccessLevels", userID, userIDs, userEmails, newAccessLevel, comment)
}

// RegisterUpdateAccessLevels indicates an expected call of RegisterUpdateAccessLevels.
func (mr *MockUserActivityInteracterMockRecorder) RegisterUpdateAccessLevels(userID, userIDs, userEmails, newAccessLevel, comment interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterUpdateAccessLevels", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterUpdateAccessLevels), userID, userIDs, userEmails, newAccessLevel, comment)
}

// RegisterUpdateSettings mocks base method.
func (m *MockUserActivityInteracter) RegisterUpdateSettings(userID string, vars []*entity.UserActivityVar) error {
	m.ctrl.T.Helper()
	ret := m.ctrl.Call(m, "RegisterUpdateSettings", userID, vars)
	ret0, _ := ret[0].(error)
	return ret0
}

// RegisterUpdateSettings indicates an expected call of RegisterUpdateSettings.
func (mr *MockUserActivityInteracterMockRecorder) RegisterUpdateSettings(userID, vars interface{}) *gomock.Call {
	mr.mock.ctrl.T.Helper()
	return mr.mock.ctrl.RecordCallWithMethodType(mr.mock, "RegisterUpdateSettings", reflect.TypeOf((*MockUserActivityInteracter)(nil).RegisterUpdateSettings), userID, vars)
}
