// Code generated by mockery v1.0.0. DO NOT EDIT.

package mocks

import entity "gitlab.com/konstellation/kre/admin-api/domain/entity"
import mock "github.com/stretchr/testify/mock"

// MonitoringService is an autogenerated mock type for the MonitoringService type
type MonitoringService struct {
	mock.Mock
}

// NodeLogs provides a mock function with given fields: runtime, nodeID, stopCh
func (_m *MonitoringService) NodeLogs(runtime *entity.Runtime, nodeID string, stopCh <-chan bool) (<-chan *entity.NodeLog, error) {
	ret := _m.Called(runtime, nodeID, stopCh)

	var r0 <-chan *entity.NodeLog
	if rf, ok := ret.Get(0).(func(*entity.Runtime, string, <-chan bool) <-chan *entity.NodeLog); ok {
		r0 = rf(runtime, nodeID, stopCh)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(<-chan *entity.NodeLog)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(*entity.Runtime, string, <-chan bool) error); ok {
		r1 = rf(runtime, nodeID, stopCh)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// VersionStatus provides a mock function with given fields: runtime, versionName, stopCh
func (_m *MonitoringService) VersionStatus(runtime *entity.Runtime, versionName string, stopCh <-chan bool) (<-chan *entity.VersionNodeStatus, error) {
	ret := _m.Called(runtime, versionName, stopCh)

	var r0 <-chan *entity.VersionNodeStatus
	if rf, ok := ret.Get(0).(func(*entity.Runtime, string, <-chan bool) <-chan *entity.VersionNodeStatus); ok {
		r0 = rf(runtime, versionName, stopCh)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(<-chan *entity.VersionNodeStatus)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(*entity.Runtime, string, <-chan bool) error); ok {
		r1 = rf(runtime, versionName, stopCh)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}