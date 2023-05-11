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
	productID := "product-id"
	productName := "product-name"
	productDescription := "This is a product description"
	expectedProduct := &entity.Product{
		ID:           productID,
		Name:         productName,
		Description:  productDescription,
		CreationDate: time.Time{},
		Owner:        user.ID,
	}

	s.mocks.accessControl.EXPECT().CheckPermission(user, productID, auth.ActCreateProduct).Return(nil)
	s.mocks.productRepo.EXPECT().GetByID(ctx, productID).Return(nil, usecase.ErrProductNotFound)
	s.mocks.productRepo.EXPECT().GetByName(ctx, productName).Return(nil, usecase.ErrProductNotFound)
	s.mocks.productRepo.EXPECT().Create(ctx, expectedProduct).Return(expectedProduct, nil)
	s.mocks.measurementRepo.EXPECT().CreateDatabase(productID).Return(nil)
	s.mocks.versionRepo.EXPECT().CreateIndexes(ctx, productID).Return(nil)
	s.mocks.metricRepo.EXPECT().CreateIndexes(ctx, productID).Return(nil)
	s.mocks.nodeLogRepo.EXPECT().CreateIndexes(ctx, productID).Return(nil)

	product, err := s.productInteractor.CreateProduct(ctx, user, productID, productName, productDescription)

	require.Nil(t, err)
	require.Equal(t, expectedProduct, product)
}

func TestCreateNewProduct_FailsIfUserHasNotPermission(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	user := &token.UserRoles{ID: "user1234"}
	productID := "product-id"
	productName := "product-name"
	productDescription := "This is a product description"

	permissionError := errors.New("permission error")

	s.mocks.accessControl.EXPECT().CheckPermission(user, productID, auth.ActCreateProduct).Return(permissionError)

	product, err := s.productInteractor.CreateProduct(ctx, user, productID, productName, productDescription)

	require.Error(t, permissionError, err)
	require.Nil(t, product)
}

func TestCreateNewProduct_FailsIfProductHasAnInvalidField(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	user := &token.UserRoles{ID: "user1234"}
	productID := "product-id"
	// the product name is bigger thant the max length (it should be lte=40)
	productName := "lore ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labores"
	productDescription := "This is a product description"

	s.mocks.accessControl.EXPECT().CheckPermission(user, productID, auth.ActCreateProduct).Return(nil)

	product, err := s.productInteractor.CreateProduct(ctx, user, productID, productName, productDescription)

	require.Error(t, err)
	require.Nil(t, product)
}

func TestCreateNewProduct_FailsIfProductWithSameIDAlreadyExists(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()

	user := &token.UserRoles{
		ID: "user1234",
	}

	productID := "product-id"
	productName := "product-name"
	productDescription := "This is a product description"

	existingProduct := &entity.Product{
		ID:          productID,
		Name:        "existing-product-name",
		Description: "existing-product-description",
	}

	s.mocks.accessControl.EXPECT().CheckPermission(user, productID, auth.ActCreateProduct).Return(nil)
	s.mocks.productRepo.EXPECT().GetByID(ctx, productID).Return(existingProduct, nil)

	product, err := s.productInteractor.CreateProduct(ctx, user, productID, productName, productDescription)

	require.Error(t, err)
	require.Nil(t, product)
}

func TestCreateNewProduct_FailsIfProductWithSameNameAlreadyExists(t *testing.T) {
	s := newProductSuite(t)
	defer s.ctrl.Finish()

	ctx := context.Background()
	user := &token.UserRoles{ID: "user1234"}

	productName := "product-name"
	productID := "new-product-id"
	productDescription := "This is a product description"

	existingProduct := &entity.Product{
		ID:          "existing-product-id",
		Name:        productName,
		Description: "existing-product-description",
	}

	s.mocks.accessControl.EXPECT().CheckPermission(user, productID, auth.ActCreateProduct).Return(nil)
	s.mocks.productRepo.EXPECT().GetByID(ctx, productID).Return(nil, usecase.ErrProductNotFound)
	s.mocks.productRepo.EXPECT().GetByName(ctx, productName).Return(existingProduct, nil)

	product, err := s.productInteractor.CreateProduct(ctx, user, productID, productName, productDescription)

	require.Error(t, err)
	require.Nil(t, product)
}

func TestCreateNewProduct_FailsIfCreateProductFails(t *testing.T) {
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

	s.mocks.accessControl.EXPECT().CheckPermission(user, productID, auth.ActCreateProduct).Return(nil)
	s.mocks.productRepo.EXPECT().GetByID(ctx, productID).Return(nil, usecase.ErrProductNotFound)
	s.mocks.productRepo.EXPECT().GetByName(ctx, productName).Return(nil, usecase.ErrProductNotFound)
	s.mocks.productRepo.EXPECT().Create(ctx, newProduct).Return(nil, errors.New("create product error"))

	product, err := s.productInteractor.CreateProduct(ctx, user, productID, productName, productDescription)

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
	s.mocks.productRepo.EXPECT().FindByIDs(ctx, []string{productID}).Return(expected, nil)

	actual, err := s.productInteractor.FindAll(ctx, user)

	require.Nil(t, err)
	require.Equal(t, expected, actual)
}
