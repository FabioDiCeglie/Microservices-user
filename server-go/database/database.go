package database

import (
	"context"
	"fmt"
	"log"
	"os"

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

func ConnectMongo() *mongo.Collection {
	LoadEnv()

	url := os.Getenv("MONGO_URL")
	if url == "" {
		log.Fatal("MONGO_URL environment variable is not set")
	}

	// Connect to the database.
	clientOptions := options.Client().ApplyURI(url)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal(err)
	}

	// Check the connection.
	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal(err)
	}

	// Create collection
	collection := client.Database("staging").Collection("user")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to db")

	return collection
}

func InitMongoDatabase() error {
	LoadEnv()

	ConnectMongo()

	fmt.Println("MongoDB database initialized!")
	return nil
}
