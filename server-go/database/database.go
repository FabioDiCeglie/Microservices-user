package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	MongoClient *mongo.Client
	Db          *mongo.Database
)

func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
}

func ConnectMongo() error {
	// Set client options
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGO_URL"))

	// Connect to MongoDB
	client, err := mongo.NewClient(clientOptions)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		return err
	}

	fmt.Println("Connected to MongoDB!")

	MongoClient = client
	return nil
}

func InitMongoDatabase() error {
	err := ConnectMongo()
	if err != nil {
		return err
	}

	Db = MongoClient.Database(os.Getenv("MONGO_DATABASE_NAME"))

	fmt.Println("MongoDB database initialized!")
	return nil
}
