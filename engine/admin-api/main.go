package main

import (
	"context"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/repository/influx"
	"log"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/auth"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/repository/mongodb"
	"github.com/konstellation-io/kre/engine/admin-api/adapter/runtime"
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

	verificationCodeRepo := mongodb.NewVerificationCodeRepoMongoDB(cfg, logger, mongodbClient)
	userRepo := mongodb.NewUserRepoMongoDB(cfg, logger, mongodbClient)
	runtimeRepo := mongodb.NewRuntimeRepoMongoDB(cfg, logger, mongodbClient)
	settingRepo := mongodb.NewSettingRepoMongoDB(cfg, logger, mongodbClient)
	sessionRepo := mongodb.NewSessionRepoMongoDB(cfg, logger, mongodbClient)
	apiTokenRepo, err := mongodb.NewAPITokenRepoMongoDB(cfg, logger, mongodbClient)
	if err != nil {
		log.Fatal(err)
	}
	userActivityRepo := mongodb.NewUserActivityRepoMongoDB(cfg, logger, mongodbClient)
	versionMongoRepo := mongodb.NewVersionRepoMongoDB(cfg, logger, mongodbClient)
	nodeLogRepo := mongodb.NewNodeLogMongoDBRepo(cfg, logger, mongodbClient)
	metricRepo := mongodb.NewMetricMongoDBRepo(cfg, logger, mongodbClient)
	measurementRepo := influx.NewMeasurementRepoInfluxDB(cfg, logger)

	versionService, err := service.NewK8sVersionClient(cfg, logger)
	if err != nil {
		log.Fatal(err)
	}

	loginLinkTransport := auth.NewSMTPLoginLinkTransport(cfg, logger)
	verificationCodeGenerator := auth.NewUUIDVerificationCodeGenerator()
	accessControl, err := auth.NewCasbinAccessControl(logger, userRepo, "./casbin_rbac_model.conf", "./casbin_rbac_policy.csv")
	if err != nil {
		log.Fatal(err)
	}

	passwordGenerator := runtime.NewPasswordGenerator()

	idGenerator := version.NewIDGenerator()
	docGenerator := version.NewHTTPStaticDocGenerator(cfg, logger)

	userActivityInteractor := usecase.NewUserActivityInteractor(logger, userActivityRepo, userRepo, accessControl)
	authInteractor := usecase.NewAuthInteractor(
		cfg,
		logger,
		loginLinkTransport,
		verificationCodeGenerator,
		verificationCodeRepo,
		userRepo,
		settingRepo,
		userActivityInteractor,
		sessionRepo,
		apiTokenRepo,
		accessControl,
	)

	runtimeInteractor := usecase.NewRuntimeInteractor(
		cfg,
		logger,
		runtimeRepo,
		measurementRepo,
		versionMongoRepo,
		metricRepo,
		nodeLogRepo,
		userActivityInteractor,
		passwordGenerator,
		accessControl,
	)

	userInteractor := usecase.NewUserInteractor(
		logger,
		userRepo,
		userActivityInteractor,
		sessionRepo,
		apiTokenRepo,
		accessControl,
		authInteractor,
	)

	settingInteractor := usecase.NewSettingInteractor(logger, settingRepo, userActivityInteractor, accessControl)

	chronografDashboard := service.CreateDashboardService(cfg, logger)
	versionInteractor := usecase.NewVersionInteractor(
		cfg,
		logger,
		versionMongoRepo,
		runtimeRepo,
		versionService,
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

	err = settingInteractor.CreateDefaults(context.Background())
	if err != nil {
		panic(err)
	}

	err = runtimeInteractor.EnsureRuntimeIsCreated(context.Background())
	if err != nil {
		panic(err)
	}

	app := http.NewApp(
		cfg,
		logger,
		authInteractor,
		runtimeInteractor,
		userInteractor,
		settingInteractor,
		userActivityInteractor,
		versionInteractor,
		metricsInteractor,
	)
	app.Start()
}
