package usecase_test

import (
	"testing"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"

	"gitlab.com/konstellation/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/kre/admin-api/mocks"
)

type UserSuite struct {
	suite.Suite
	mocks      UserSuiteMocks
	interactor *usecase.UserInteractor
}

type UserSuiteMocks struct {
	logger   *mocks.Logger
	userRepo *mocks.UserRepo
}

func TestUserSuite(t *testing.T) {
	suite.Run(t, new(UserSuite))
}

func (s *UserSuite) SetupTest() {
	s.mocks = UserSuiteMocks{
		logger:   new(mocks.Logger),
		userRepo: new(mocks.UserRepo),
	}

	// FIXME use another mock lib: https://gitlab.com/konstellation/kre/issues/198
	s.mocks.logger.On("Info", mock.Anything).Return()
	s.mocks.logger.On("Warn", mock.Anything).Return()
	s.mocks.logger.On("Error", mock.Anything).Return()
	s.mocks.logger.On("Infof", mock.Anything).Return()
	s.mocks.logger.On("Infof", mock.Anything, mock.Anything).Return()
	s.mocks.logger.On("Warnf", mock.Anything).Return()
	s.mocks.logger.On("Errorf", mock.Anything).Return()

	s.interactor = usecase.NewUserInteractor(
		s.mocks.logger,
		s.mocks.userRepo,
	)
}

func (s *UserSuite) TestGetByID() {
	t := s.T()

	userID := "user1"

	userFound := &entity.User{
		ID:    userID,
		Email: "test@test.com",
	}

	s.mocks.userRepo.On("GetByID", userID).Return(userFound, nil)

	res, err := s.interactor.GetByID(userID)
	require.Nil(t, err)
	require.EqualValues(t, res, userFound)
}

func (s *UserSuite) TestGetAllUsers() {
	t := s.T()

	usersFound := []*entity.User{
		{
			ID:    "user1",
			Email: "test@test.com",
		},
	}

	s.mocks.userRepo.On("GetAll").Return(usersFound, nil)

	res, err := s.interactor.GetAllUsers()
	require.Nil(t, err)
	require.EqualValues(t, res, usersFound)
}
