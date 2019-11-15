package main

import (
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/auth"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/logging"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/repository"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/delivery/http"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
)

func main() {
	cfg := config.NewConfig()
	logger := logging.NewLogger()

	tokenRepo := repository.NewMemTokenRepo(cfg, logger)
	userRepo := repository.NewMemUserRepo(cfg, logger)

	tokenGenerator := auth.NewByteTokenGenerator()
	tokenTransport := auth.NewTransportSMTP(cfg, logger)

	authInteractor := usecase.NewAuthInteractor(logger, tokenGenerator, tokenTransport, tokenRepo, userRepo)

	app := http.NewApp(
		cfg,
		logger,
		authInteractor,
	)
	app.Start()
}
