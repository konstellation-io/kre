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

	k8sManagerService := service.NewK8sManagerServiceGRPC(cfg, logger)

	loginLinkTransport := auth.NewSMTPLoginLinkTransport(cfg, logger)
	verificationCodeGenerator := auth.NewUUIDVerificationCodeGenerator()

	authInteractor := usecase.NewAuthInteractor(
		logger, loginLinkTransport, verificationCodeGenerator, verificationCodeRepo, userRepo)

	runtimeInteractor := usecase.NewRuntimeInteractor(logger, runtimeRepo, k8sManagerService)
	userInteractor := usecase.NewUserInteractor(logger, userRepo)

	app := http.NewApp(
		cfg,
		logger,
		authInteractor,
		runtimeInteractor,
		userInteractor,
	)
	app.Start()
}
