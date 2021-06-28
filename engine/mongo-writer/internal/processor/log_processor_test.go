package processor_test

import (
	"context"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/parser"
	nc "github.com/nats-io/nats.go"
	"testing"
	"time"

	"github.com/golang/mock/gomock"

	"github.com/konstellation-io/kre/engine/mongo-writer/internal/config"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/logging"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/mongodb"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/nats"
	"github.com/konstellation-io/kre/engine/mongo-writer/internal/processor"
)

type logProcessorSuite struct {
	ctrl         *gomock.Controller
	cfg          *config.Config
	logProcessor *processor.LogsProcessor
	mocks        logProcessorMocks
}

type logProcessorMocks struct {
	logger   *logging.MockLogger
	mongoM   *mongodb.MockMongoManager
	natsM    *nats.MockNATSManager
	fbParser *parser.MockFluentbitMsgParser
}

func newLogProcessorSuite(t *testing.T) *logProcessorSuite {
	ctrl := gomock.NewController(t)

	cfg := &config.Config{}

	logger := logging.NewMockLogger(ctrl)
	logging.AddLoggerExpects(logger)

	mongoM := mongodb.NewMockMongoManager(ctrl)
	natsM := nats.NewMockNATSManager(ctrl)
	fbParser := parser.NewMockFluentbitMsgParser(ctrl)

	logProcessor := processor.NewLogsProcessor(cfg, logger, mongoM, natsM, fbParser)

	return &logProcessorSuite{
		ctrl:         ctrl,
		cfg:          cfg,
		logProcessor: logProcessor,
		mocks: logProcessorMocks{
			logger:   logger,
			mongoM:   mongoM,
			natsM:    natsM,
			fbParser: fbParser,
		},
	}
}

func TestDataProcessor_ProcessMsgs(t *testing.T) {
	s := newLogProcessorSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	logsCh := make(chan *nc.Msg, 1)
	testMsg := &nc.Msg{
		Subject: "test",
		Data:    []byte("test"),
	}

	fbOutput := []parser.LogMsg{
		{Message: "test"},
	}

	var expectedCalls int64 = 1
	s.mocks.natsM.EXPECT().IncreaseTotalMsgs(expectedCalls)
	s.mocks.fbParser.EXPECT().Parse(testMsg.Data).Return(fbOutput, nil)
	s.mocks.mongoM.EXPECT().InsertMany(ctx, s.cfg.MongoDB.LogsDBName, processor.LogsCollName, fbOutput)

	go s.logProcessor.ProcessMsgs(ctx, logsCh)

	logsCh <- testMsg

	time.Sleep(500 * time.Millisecond)
}
