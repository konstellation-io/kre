package main

import (
	"github.com/konstellation-io/kre/libs/simplelogger"

	"github.com/konstellation-io/kre/admin-api/adapter/auth"
	"github.com/konstellation-io/kre/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin-api/adapter/repository/minio"
	"github.com/konstellation-io/kre/admin-api/adapter/repository/mongodb"
	"github.com/konstellation-io/kre/admin-api/adapter/runtime"
	"github.com/konstellation-io/kre/admin-api/adapter/service"
	"github.com/konstellation-io/kre/admin-api/delivery/http"
	"github.com/konstellation-io/kre/admin-api/domain/usecase"
)

func main() {
	cfg := config.NewConfig()
	logger := simplelogger.New(simplelogger.LevelDebug)

	db := mongodb.NewMongoDB(cfg, logger)
	defer db.Disconnect()
	mongodbClient := db.Connect()

	verificationCodeRepo := mongodb.NewVerificationCodeRepoMongoDB(cfg, logger, mongodbClient)
	userRepo := mongodb.NewUserRepoMongoDB(cfg, logger, mongodbClient)
	runtimeRepo := mongodb.NewRuntimeRepoMongoDB(cfg, logger, mongodbClient)
	settingRepo := mongodb.NewSettingRepoMongoDB(cfg, logger, mongodbClient)
	sessionRepo := mongodb.NewSessionRepoMongoDB(cfg, logger, mongodbClient)
	userActivityRepo := mongodb.NewUserActivityRepoMongoDB(cfg, logger, mongodbClient)
	versionMongoRepo := mongodb.NewVersionRepoMongoDB(cfg, logger, mongodbClient)

	runtimeService, err := service.NewK8sRuntimeClient(cfg, logger)
	if err != nil {
		panic(err)
	}
	versionService, err := service.NewK8sVersionClient(cfg, logger)
	if err != nil {
		panic(err)
	}

	monitoringService := service.NewMonitoringService(cfg, logger)
	resourceMetricsService, err := service.NewResourceMetricsService(cfg, logger)
	if err != nil {
		panic(err)
	}

	loginLinkTransport := auth.NewSMTPLoginLinkTransport(cfg, logger)
	verificationCodeGenerator := auth.NewUUIDVerificationCodeGenerator()

	paswordGenerator := runtime.NewPasswordGenerator()

	userActivityInteractor := usecase.NewUserActivityInteractor(logger, userActivityRepo, userRepo)
	authInteractor := usecase.NewAuthInteractor(
		logger,
		loginLinkTransport,
		verificationCodeGenerator,
		verificationCodeRepo,
		userRepo,
		settingRepo,
		userActivityInteractor,
		sessionRepo,
	)

	runtimeInteractor := usecase.NewRuntimeInteractor(logger, runtimeRepo, runtimeService, userActivityInteractor, paswordGenerator)
	userInteractor := usecase.NewUserInteractor(logger, userRepo, userActivityInteractor, sessionRepo)
	settingInteractor := usecase.NewSettingInteractor(logger, settingRepo, userActivityInteractor)

	minioCreateStorage := minio.CreateStorage
	versionInteractor := usecase.NewVersionInteractor(logger, versionMongoRepo, runtimeRepo, versionService, monitoringService, userActivityInteractor, minioCreateStorage)

	metricsInteractor := usecase.NewMetricsInteractor(logger, runtimeRepo, monitoringService)
	resourceMetricsInteractor := usecase.NewResourceMetricsInteractor(logger, runtimeRepo, versionMongoRepo, resourceMetricsService)

	err = settingInteractor.CreateDefaults()
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
		resourceMetricsInteractor,
	)
	app.Start()
}
