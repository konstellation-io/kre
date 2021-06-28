package logging

import "github.com/golang/mock/gomock"

// AddLoggerExpects add stubs for all logging functions.
func AddLoggerExpects(logger *MockLogger) {
	logger.EXPECT().Debug(gomock.Any()).Return().AnyTimes()
	logger.EXPECT().Info(gomock.Any()).Return().AnyTimes()
	logger.EXPECT().Warn(gomock.Any()).Return().AnyTimes()
	logger.EXPECT().Error(gomock.Any()).Return().AnyTimes()
	logger.EXPECT().Debugf(gomock.Any(), gomock.Any()).Return().AnyTimes()
	logger.EXPECT().Infof(gomock.Any(), gomock.Any()).Return().AnyTimes()
	logger.EXPECT().Warnf(gomock.Any(), gomock.Any()).Return().AnyTimes()
	logger.EXPECT().Errorf(gomock.Any(), gomock.Any()).Return().AnyTimes()
}
