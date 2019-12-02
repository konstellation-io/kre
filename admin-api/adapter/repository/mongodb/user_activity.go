package mongodb

import (
	"context"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/adapter/config"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/entity"
	"gitlab.com/konstellation/konstellation-ce/kre/admin-api/domain/usecase/logging"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"time"
)

const dateFormat = "2006-01-02"

type UserActivityRepoMongoDB struct {
	cfg        *config.Config
	logger     logging.Logger
	collection *mongo.Collection
}

func NewUserActivityRepoMongoDB(cfg *config.Config, logger logging.Logger, client *mongo.Client) *UserActivityRepoMongoDB {
	collection := client.Database(cfg.MongoDB.DBName).Collection("userActivity")
	return &UserActivityRepoMongoDB{
		cfg,
		logger,
		collection,
	}
}

func (r *UserActivityRepoMongoDB) Get(userEmail *string, activityType *string, fromDate *string, toDate *string) ([]entity.UserActivity, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	filter := bson.M{}
	if activityType != nil {
		filter["type"] = *activityType
	}

	if userEmail != nil {
		filter["user.email"] = *userEmail
	}

	if fromDate != nil || toDate != nil {
		filterDate := bson.M{}

		if fromDate != nil {
			from, err := time.Parse(dateFormat, *fromDate)
			if err != nil {
				return nil, err
			}
			filterDate["$gte"] = from
		}

		if toDate != nil {
			to, err := time.Parse(dateFormat, *toDate)
			if err != nil {
				return nil, err
			}
			to = time.Date(to.Year(), to.Month(), to.Day(), 23, 59, 59, 999999999, to.Location())
			filterDate["$lte"] = to
		}

		filter["date"] = filterDate
	}

	var activities []entity.UserActivity
	cur, err := r.collection.Find(ctx, filter)
	if err != nil {
		return activities, err
	}
	defer cur.Close(ctx)

	for cur.Next(ctx) {
		var activity entity.UserActivity
		err = cur.Decode(&activity)
		if err != nil {
			return activities, err
		}
		activities = append(activities, activity)
	}

	return activities, nil
}

func (r *UserActivityRepoMongoDB) Create(activity entity.UserActivity) error {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	_, err := r.collection.InsertOne(ctx, activity)
	if err != nil {
		return err
	}

	return nil
}
