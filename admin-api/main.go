package main

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/auth"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/repository/mongodb"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/service"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/delivery/http"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
)

func main() {
	cfg := config.NewConfig()
	logger := logging.NewLogger()

	db := mongodb.NewMongoDB(cfg, logger)
	mongodbClient := db.Connect()

	verificationCodeRepo := mongodb.NewVerificationCodeRepoMongoDB(cfg, logger, mongodbClient)
	userRepo := mongodb.NewUserRepoMongoDB(cfg, logger, mongodbClient)
	runtimeRepo := mongodb.NewRuntimeRepoMongoDB(cfg, logger, mongodbClient)
	settingRepo := mongodb.NewSettingRepoMongoDB(cfg, logger, mongodbClient)
	userActivityRepo := mongodb.NewUserActivityRepoMongoDB(cfg, logger, mongodbClient)
	versionRepo := mongodb.NewVersionRepoMongoDB(cfg, logger, mongodbClient)

	k8sManagerService := service.NewK8sManagerServiceGRPC(cfg, logger)
	runtimeService := service.NewRuntimeAPIServiceGRPC(cfg, logger)

	loginLinkTransport := auth.NewSMTPLoginLinkTransport(cfg, logger)
	verificationCodeGenerator := auth.NewUUIDVerificationCodeGenerator()

	userActivityInteractor := usecase.NewUserActivityInteractor(logger, userActivityRepo, userRepo)
	authInteractor := usecase.NewAuthInteractor(
		logger, loginLinkTransport, verificationCodeGenerator, verificationCodeRepo, userRepo, settingRepo, userActivityInteractor)

	runtimeInteractor := usecase.NewRuntimeInteractor(logger, runtimeRepo, k8sManagerService, userActivityInteractor)
	userInteractor := usecase.NewUserInteractor(logger, userRepo)
	settingInteractor := usecase.NewSettingInteractor(logger, settingRepo)
	versionInteractor := usecase.NewVersionInteractor(logger, versionRepo, runtimeRepo, runtimeService)

	err := settingInteractor.CreateDefaults()
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
	)
	app.Start()
}
