package entity

type User struct {
	ID    string `bson:"_id"`
	Email string `bson:"email"`
}
