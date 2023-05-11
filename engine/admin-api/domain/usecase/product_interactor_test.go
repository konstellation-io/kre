package usecase_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/token"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/require"

	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/mocks"
)

type productSuite struct {
	ctrl              *gomock.Controller
	productInteractor *usecase.ProductInteractor
	mocks             *productSuiteMocks
}

type productSuiteMocks struct {
	logger           *mocks.MockLogger
	productRepo      *mocks.MockProductRepo
	measurementRepo  *mocks.MockMeasurementRepo
	versionRepo      *mocks.MockVersionRepo
	metricRepo       *mocks.MockMetricRepo
	nodeLogRepo      *mocks.MockNodeLogRepository
	userActivityRepo *mocks.MockUserActivityRepo
	accessControl    *mocks.MockAccessControl
}

const (
	k8sNamespace = "kre-test"
)

func newProductSuite(t *testing.T) *productSuite {
	ctrl := gomock.NewController(t)

	logger := mocks.NewMockLogger(ctrl)
	productRepo := mocks.NewMockProductRepo(ctrl)
	userActivityRepo := mocks.NewMockUserActivityRepo(ctrl)
	measurementRepo := mocks.NewMockMeasurementRepo(ctrl)
	versionRepo := mocks.NewMockVersionRepo(ctrl)
	metricRepo := mocks.NewMockMetricRepo(ctrl)
	nodeLogRepo := mocks.NewMockNodeLogRepository(ctrl)
	accessControl := mocks.NewMockAccessControl(ctrl)

	mocks.AddLoggerExpects(logger)

	userActivity := usecase.NewUserActivityInteractor(
		logger,
		userActivityRepo,
		accessControl,
	)

	cfg := &config.Config{}

	cfg.K8s.Namespace = k8sNamespace

	productInteractor := usecase.NewProductInteractor(
		cfg,
		logger,
		productRepo,
		measurementRepo,
		versionRepo,
		metricRepo,
		nodeLogRepo,
		userActivity,
		accessControl,
	)

	return &productSuite{
		ctrl:              ctrl,
		productInteractor: productInteractor,
		mocks: &productSuiteMocks{
			logger,
			productRepo,
			measurementRepo,
			versionRepo,
			metricRepo,
			nodeLogRepo,
			userActivityRepo,
			accessControl,
		},
	}
}

func TestGet(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	productID := "product1"
	expectedProduct := &entity.Product{
		ID: productID,
	}

	user := &token.UserRoles{
		ID: "user1234",
	}

	ctx := context.Background()

	s.mocks.accessControl.EXPECT().CheckPermission(user, productID, auth.ActViewProduct)
	s.mocks.productRepo.EXPECT().Get(ctx).Return(expectedProduct, nil)

	product, err := s.productInteractor.Get(ctx, user, productID)
	require.Nil(t, err)
	require.Equal(t, expectedProduct, product)
}

func TestCreateNewProduct(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	user := &token.UserRoles{ID: "user1234"}
	newRuntimeId := "product-id"
	newRuntimeName := "product-name"
	newRuntimeDescription := "This is a product description"
	expectedRuntime := &entity.Product{
		ID:           newRuntimeId,
		Name:         newRuntimeName,
		Description:  newRuntimeDescription,
		CreationDate: time.Time{},
		Owner:        userID,
	}

	s.mocks.accessControl.EXPECT().CheckPermission(userID, productID, auth.ActEdit).Return(nil)
	s.mocks.productRepo.EXPECT().GetByID(ctx, newRuntimeId).Return(nil, usecase.ErrProductNotFound)
	s.mocks.productRepo.EXPECT().GetByName(ctx, newRuntimeName).Return(nil, usecase.ErrProductNotFound)
	s.mocks.productRepo.EXPECT().Create(ctx, expectedRuntime).Return(expectedRuntime, nil)
	s.mocks.measurementRepo.EXPECT().CreateDatabase(newRuntimeId).Return(nil)
	s.mocks.versionRepo.EXPECT().CreateIndexes(ctx, newRuntimeId).Return(nil)
	s.mocks.metricRepo.EXPECT().CreateIndexes(ctx, newRuntimeId).Return(nil)
	s.mocks.nodeLogRepo.EXPECT().CreateIndexes(ctx, newRuntimeId).Return(nil)

	product, err := s.productInteractor.CreateRuntime(ctx, userID, newRuntimeId, newRuntimeName, newRuntimeDescription)

	require.Nil(t, err)
	require.Equal(t, expectedRuntime, product)
}

func TestCreateNewRuntime_FailsIfUserHasNotPermission(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	user := &token.UserRoles{ID: "user1234"}
	newRuntimeId := "product-id"
	newRuntimeName := "product-name"
	newRuntimeDescription := "This is a product description"

	permissionError := errors.New("permission error")

	s.mocks.accessControl.EXPECT().CheckPermission(userID, productID, auth.ActEdit).Return(permissionError)

	product, err := s.productInteractor.CreateRuntime(ctx, userID, newRuntimeId, newRuntimeName, newRuntimeDescription)

	require.Error(t, permissionError, err)
	require.Nil(t, product)
}

func TestCreateNewRuntime_FailsIfRuntimeHasAnInvalidField(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	user := &token.UserRoles{ID: "user1234"}
	newRuntimeId := "product-id"
	// the product name is bigger thant the max length (it should be lte=40)
	newRuntimeName := "lore ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labores"
	newRuntimeDescription := "This is a product description"

	s.mocks.accessControl.EXPECT().CheckPermission(userID, productID, auth.ActEdit).Return(nil)

	product, err := s.productInteractor.CreateRuntime(ctx, userID, newRuntimeId, newRuntimeName, newRuntimeDescription)

	require.Error(t, err)
	require.Nil(t, product)
}

func TestCreateNewRuntime_FailsIfRuntimeWithSameIDAlreadyExists(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	user := &token.UserRoles{
		ID: "user1234",
	}

	productID := "product-id"
	newRuntimeName := "product-name"
	newRuntimeDescription := "This is a product description"

	existingRuntime := &entity.Product{
		ID:          productID,
		Name:        "existing-product-name",
		Description: "existing-product-description",
	}

	s.mocks.accessControl.EXPECT().CheckPermission(user, productID, auth.ActCreateProduct).Return(nil)
	s.mocks.productRepo.EXPECT().GetByID(ctx, productID).Return(existingRuntime, nil)

	product, err := s.productInteractor.CreateRuntime(ctx, user, productID, newRuntimeName, newRuntimeDescription)

	require.Error(t, err)
	require.Nil(t, product)
}

func TestCreateNewRuntime_FailsIfRuntimeWithSameNameAlreadyExists(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	user := &token.UserRoles{ID: "user1234"}

	productName := "product-name"
	productID := "new-product-id"
	productDescription := "This is a product description"

	existingRuntime := &entity.Product{
		ID:          "existing-product-id",
		Name:        productName,
		Description: "existing-product-description",
	}

	s.mocks.accessControl.EXPECT().CheckPermission(user, productID, auth.ActCreateProduct).Return(nil)
	s.mocks.productRepo.EXPECT().GetByID(ctx, productID).Return(nil, usecase.ErrProductNotFound)
	s.mocks.productRepo.EXPECT().GetByName(ctx, productName).Return(existingRuntime, nil)

	product, err := s.productInteractor.CreateRuntime(ctx, user, productID, productName, productDescription)

	require.Error(t, err)
	require.Nil(t, product)
}

func TestCreateNewRuntime_FailsIfCreateRuntimeFails(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	user := &token.UserRoles{ID: "user1234"}
	productName := "product-name"
	productID := "new-product-id"
	productDescription := "This is a product description"

	newProduct := &entity.Product{
		ID:           productID,
		Name:         productName,
		Description:  productDescription,
		Owner:        user.ID,
		CreationDate: time.Time{},
	}

	s.mocks.accessControl.EXPECT().CheckPermission(user, productID, auth.ActEdit).Return(nil)
	s.mocks.productRepo.EXPECT().GetByID(ctx, productID).Return(nil, usecase.ErrProductNotFound)
	s.mocks.productRepo.EXPECT().GetByName(ctx, productName).Return(nil, usecase.ErrProductNotFound)
	s.mocks.productRepo.EXPECT().Create(ctx, newProduct).Return(nil, errors.New("create product error"))

	product, err := s.productInteractor.CreateRuntime(ctx, user, productID, productName, productDescription)

	require.Error(t, err)
	require.Nil(t, product)
}

func TestGetByID(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	user := &token.UserRoles{ID: "user1234"}
	productID := "product-id"
	productName := "product-name"

	expected := &entity.Product{
		ID:           productID,
		Name:         productName,
		Description:  "Product description...",
		CreationDate: time.Time{},
	}

	s.mocks.accessControl.EXPECT().CheckPermission(user, productID, auth.ActViewProduct).Return(nil)
	s.mocks.productRepo.EXPECT().GetByID(ctx, productID).Return(expected, nil)

	actual, err := s.productInteractor.GetByID(ctx, user, productID)

	require.Nil(t, err)
	require.Equal(t, expected, actual)
}

func TestFindAll(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	productID := "product-id"
	productName := "product-name"

	user := &token.UserRoles{
		ID: "user1234",
		ProductRoles: map[string][]string{
			productID: {
				auth.ActViewProduct.String(),
			},
		},
	}

	expected := []*entity.Product{
		{
			ID:           productID,
			Name:         productName,
			Description:  "Product description...",
			CreationDate: time.Time{},
		},
	}

	s.mocks.accessControl.EXPECT().CheckPermission(user, productID, auth.ActViewProduct).Return(nil)
	s.mocks.productRepo.EXPECT().FindAll(ctx).Return(expected, nil)

	actual, err := s.productInteractor.FindAll(ctx, user)

	require.Nil(t, err)
	require.Equal(t, expected, actual)
}
