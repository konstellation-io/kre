package main

import (
	"log"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/auth"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/repository/influx"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/repository/mongodb"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/service"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/version"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

func main() {
	cfg := config.NewConfig()
	logger := logging.NewLogger(cfg.LogLevel)

	db := mongodb.NewMongoDB(cfg, logger)
	defer db.Disconnect()
	mongodbClient := db.Connect()

	runtimeRepo := mongodb.NewRuntimeRepoMongoDB(cfg, logger, mongodbClient)
	userActivityRepo := mongodb.NewUserActivityRepoMongoDB(cfg, logger, mongodbClient)
	versionMongoRepo := mongodb.NewVersionRepoMongoDB(cfg, logger, mongodbClient)
	nodeLogRepo := mongodb.NewNodeLogMongoDBRepo(cfg, logger, mongodbClient)
	metricRepo := mongodb.NewMetricMongoDBRepo(cfg, logger, mongodbClient)
	measurementRepo := influx.NewMeasurementRepoInfluxDB(cfg, logger)

	versionService, err := service.NewK8sVersionClient(cfg, logger)
	if err != nil {
		log.Fatal(err)
	}

	natsManagerService, err := service.NewNatsManagerClient(cfg, logger)
	if err != nil {
		log.Fatal(err)
	}

	accessControl, err := auth.NewCasbinAccessControl(logger, "./casbin_rbac_model.conf", "./casbin_rbac_policy.csv")
	if err != nil {
		log.Fatal(err)
	}

	idGenerator := version.NewIDGenerator()
	docGenerator := version.NewHTTPStaticDocGenerator(cfg, logger)

	userActivityInteractor := usecase.NewUserActivityInteractor(logger, userActivityRepo, accessControl)

	runtimeInteractor := usecase.NewRuntimeInteractor(
		cfg,
		logger,
		runtimeRepo,
		measurementRepo,
		versionMongoRepo,
		metricRepo,
		nodeLogRepo,
		userActivityInteractor,
		accessControl,
	)

	userInteractor := usecase.NewUserInteractor(
		logger,
		userActivityInteractor,
		accessControl,
	)

	chronografDashboard := service.CreateDashboardService(cfg, logger)
	versionInteractor := usecase.NewVersionInteractor(
		cfg,
		logger,
		versionMongoRepo,
		runtimeRepo,
		versionService,
		natsManagerService,
		userActivityInteractor,
		accessControl,
		idGenerator,
		docGenerator,
		chronografDashboard,
		nodeLogRepo,
	)

	metricsInteractor := usecase.NewMetricsInteractor(
		logger,
		runtimeRepo,
		accessControl,
		metricRepo,
	)

	app := http.NewApp(
		cfg,
		logger,
		runtimeInteractor,
		userInteractor,
		userActivityInteractor,
		versionInteractor,
		metricsInteractor,
	)
	app.Start()
}
