package main

import (
	"context"
	"log"

	"github.com/konstellation-io/kre/libs/simplelogger"

	"github.com/konstellation-io/kre/admin/admin-api/adapter/auth"
	"github.com/konstellation-io/kre/admin/admin-api/adapter/config"
	"github.com/konstellation-io/kre/admin/admin-api/adapter/repository/minio"
	"github.com/konstellation-io/kre/admin/admin-api/adapter/repository/mongodb"
	"github.com/konstellation-io/kre/admin/admin-api/adapter/runtime"
	"github.com/konstellation-io/kre/admin/admin-api/adapter/service"
	"github.com/konstellation-io/kre/admin/admin-api/adapter/version"
	"github.com/konstellation-io/kre/admin/admin-api/delivery/http"
	"github.com/konstellation-io/kre/admin/admin-api/domain/usecase"
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
		log.Fatal(err)
	}
	versionService, err := service.NewK8sVersionClient(cfg, logger)
	if err != nil {
		log.Fatal(err)
	}

	monitoringService := service.NewMonitoringService(cfg, logger)
	resourceMetricsService, err := service.NewResourceMetricsService(cfg, logger)
	if err != nil {
		log.Fatal(err)
	}

	loginLinkTransport := auth.NewSMTPLoginLinkTransport(cfg, logger)
	verificationCodeGenerator := auth.NewUUIDVerificationCodeGenerator()
	accessControl, err := auth.NewCasbinAccessControl(logger, userRepo)
	if err != nil {
		log.Fatal(err)
	}

	passwordGenerator := runtime.NewPasswordGenerator()

	idGenerator := version.NewIDGenerator()
	docGenerator := version.NewHTTPStaticDocGenerator(cfg, logger)

	userActivityInteractor := usecase.NewUserActivityInteractor(logger, userActivityRepo, userRepo, accessControl)
	authInteractor := usecase.NewAuthInteractor(
		logger,
		loginLinkTransport,
		verificationCodeGenerator,
		verificationCodeRepo,
		userRepo,
		settingRepo,
		userActivityInteractor,
		sessionRepo,
		accessControl,
	)

	runtimeInteractor := usecase.NewRuntimeInteractor(
		logger,
		runtimeRepo,
		runtimeService,
		userActivityInteractor,
		passwordGenerator,
		accessControl,
	)

	userInteractor := usecase.NewUserInteractor(
		logger,
		userRepo,
		userActivityInteractor,
		sessionRepo,
		accessControl,
	)

	settingInteractor := usecase.NewSettingInteractor(logger, settingRepo, userActivityInteractor, accessControl)

	minioCreateStorage := minio.CreateStorage
	chronografDashboard := service.CreateDashboardService()
	versionInteractor := usecase.NewVersionInteractor(
		cfg,
		logger,
		versionMongoRepo,
		runtimeRepo,
		versionService,
		monitoringService,
		userActivityInteractor,
		minioCreateStorage,
		accessControl,
		idGenerator,
		docGenerator,
		chronografDashboard,
	)

	metricsInteractor := usecase.NewMetricsInteractor(
		logger,
		runtimeRepo,
		monitoringService,
		accessControl,
	)

	resourceMetricsInteractor := usecase.NewResourceMetricsInteractor(
		logger,
		runtimeRepo,
		versionMongoRepo,
		resourceMetricsService,
		accessControl,
	)

	err = settingInteractor.CreateDefaults(context.Background())
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
