package usecase_test

import (
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/mocks"
	"testing"
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

	s.mocks.logger.On("Info", mock.Anything).Return()

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

	usersFound := []entity.User{
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
