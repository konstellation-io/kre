package main

import (
	"github.com/konstellation-io/kre/libs/simplelogger"
	"gitlab.com/konstellation/kre/admin-api/adapter/auth"
	"gitlab.com/konstellation/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/kre/admin-api/adapter/repository/minio"
	"gitlab.com/konstellation/kre/admin-api/adapter/repository/mongodb"
	"gitlab.com/konstellation/kre/admin-api/adapter/runtime"
	"gitlab.com/konstellation/kre/admin-api/adapter/service"
	"gitlab.com/konstellation/kre/admin-api/delivery/http"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase"
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
		logger, loginLinkTransport, verificationCodeGenerator, verificationCodeRepo, userRepo, settingRepo, userActivityInteractor)

	runtimeInteractor := usecase.NewRuntimeInteractor(logger, runtimeRepo, runtimeService, userActivityInteractor, paswordGenerator)
	userInteractor := usecase.NewUserInteractor(logger, userRepo)
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
