package usecase

import (
	"context"
	"errors"
	"strings"

	"github.com/konstellation-io/kre/engine/admin-api/adapter/config"
	"github.com/konstellation-io/kre/engine/admin-api/delivery/http/token"
	"github.com/konstellation-io/kre/engine/admin-api/domain/entity"
	"github.com/konstellation-io/kre/engine/admin-api/domain/repository"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/auth"
	"github.com/konstellation-io/kre/engine/admin-api/domain/usecase/logging"
)

var (
	// ErrProductNotFound error
	ErrProductNotFound       = errors.New("error product not found")
	ErrProductDuplicated     = errors.New("there is already a product with the same id")
	ErrProductDuplicatedName = errors.New("there is already a product with the same name")
)

// ProductInteractor contains app logic to handle Product entities
type ProductInteractor struct {
	cfg             *config.Config
	logger          logging.Logger
	productRepo     repository.ProductRepo
	measurementRepo repository.MeasurementRepo
	versionRepo     repository.VersionRepo
	metricRepo      repository.MetricRepo
	nodeLogRepo     repository.NodeLogRepository
	userActivity    UserActivityInteracter
	accessControl   auth.AccessControl
}

// NewProductInteractor creates a new ProductInteractor
func NewProductInteractor(
	cfg *config.Config,
	logger logging.Logger,
	productRepo repository.ProductRepo,
	measurementRepo repository.MeasurementRepo,
	versionRepo repository.VersionRepo,
	metricRepo repository.MetricRepo,
	nodeLogRepo repository.NodeLogRepository,
	userActivity UserActivityInteracter,
	accessControl auth.AccessControl,
) *ProductInteractor {
	return &ProductInteractor{
		cfg,
		logger,
		productRepo,
		measurementRepo,
		versionRepo,
		metricRepo,
		nodeLogRepo,
		userActivity,
		accessControl,
	}
}

// CreateProduct adds a new Product
func (i *ProductInteractor) CreateProduct(
	ctx context.Context,
	user *token.UserRoles,
	productID,
	name,
	description string,
) (*entity.Product, error) {
	if err := i.accessControl.CheckPermission(user, productID, auth.ActCreateProduct); err != nil {
		return nil, err
	}

	// Sanitize input params
	productID = strings.TrimSpace(productID)
	name = strings.TrimSpace(name)
	description = strings.TrimSpace(description)

	r := &entity.Product{
		ID:          productID,
		Name:        name,
		Description: description,
		Owner:       user.ID,
	}

	// Validation
	err := r.Validate()
	if err != nil {
		return nil, err
	}

	// Check if the Product already exists
	productFromDB, err := i.productRepo.GetByID(ctx, productID)
	if productFromDB != nil {
		return nil, ErrProductDuplicated
	} else if err != ErrProductNotFound {
		return nil, err
	}

	// Check if there is another Product with the same name
	productFromDB, err = i.productRepo.GetByName(ctx, name)
	if productFromDB != nil {
		return nil, ErrProductDuplicatedName
	} else if err != ErrProductNotFound {
		return nil, err
	}

	createdProduct, err := i.productRepo.Create(ctx, r)
	if err != nil {
		return nil, err
	}

	i.logger.Info("Product stored in the database with ID=" + createdProduct.ID)
	err = i.measurementRepo.CreateDatabase(createdProduct.ID)
	if err != nil {
		return nil, err
	}
	i.logger.Info("Measurement database created for product with ID=" + createdProduct.ID)

	err = i.createDatabaseIndexes(ctx, productID)
	if err != nil {
		return nil, err
	}

	return createdProduct, nil
}

func (i *ProductInteractor) createDatabaseIndexes(ctx context.Context, productID string) error {
	err := i.metricRepo.CreateIndexes(ctx, productID)
	if err != nil {
		return err
	}

	err = i.nodeLogRepo.CreateIndexes(ctx, productID)
	if err != nil {
		return err
	}

	return i.versionRepo.CreateIndexes(ctx, productID)
}

// Get return product by id
func (i *ProductInteractor) Get(ctx context.Context, user *token.UserRoles, productID string) (*entity.Product, error) {
	if err := i.accessControl.CheckPermission(user, productID, auth.ActViewProduct); err != nil {
		return nil, err
	}

	return i.productRepo.Get(ctx)
}

// GetByID return a Product by its ID
func (i *ProductInteractor) GetByID(ctx context.Context, user *token.UserRoles, productID string) (*entity.Product, error) {
	if err := i.accessControl.CheckPermission(user, productID, auth.ActViewProduct); err != nil {
		return nil, err
	}

	return i.productRepo.GetByID(ctx, productID)
}

// FindAll returns a list of all Runtimes
func (i *ProductInteractor) FindAll(ctx context.Context, user *token.UserRoles) ([]*entity.Product, error) {
	visibleProducts := make([]string, 0, len(user.ProductRoles))
	for prod := range user.ProductRoles {
		if err := i.accessControl.CheckPermission(user, prod, auth.ActViewProduct); err == nil {
			visibleProducts = append(visibleProducts, prod)
		}
	}

	return i.productRepo.FindByIDs(ctx, visibleProducts)
}
