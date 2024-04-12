package users

import (
	"context"
	"microservice-login/database"
	"microservice-login/models"
	"microservice-login/utils"
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

func GetUserInformation(c *fiber.Ctx) error {
	db := database.Db
	tokenString := c.Get("Authorization")

	// Parse and verify the JWT
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte("secret"), nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).SendString("Unauthorized")
	}

	// Extract user data from the token claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).SendString("Unauthorized")
	}

	userID := claims["user_id"].(string) // Assuming user_id is stored as a string in the token

	// Fetch user data from MongoDB using the user ID
	var user models.User
	filter := bson.M{"_id": userID}
	if err := db.Collection("users").FindOne(context.Background(), filter).Decode(&user); err != nil {
		return c.Status(401).JSON(fiber.Map{
			"message": "Invalid user ID",
		})
	}

	// Return the user data as a JSON response
	return c.JSON(user)
}

func SignUp(c *fiber.Ctx) error {
	db := database.Db
	payload := new(struct {
		ConfirmedPassword string `json:"confirmedPassword"`
	})
	user := new(models.User)
	if err := c.BodyParser(user); err != nil {
		return c.Status(503).Send([]byte(err.Error()))
	}

	if err := c.BodyParser(payload); err != nil {
		return c.Status(503).Send([]byte(err.Error()))
	}

	if user.Password != payload.ConfirmedPassword {
		return c.Status(400).SendString("Password doesn't match")
	}

	// Hash the user's password before storing it
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).SendString("Failed to hash password")
	}

	user.Password = string(hashedPassword)

	// Insert user into MongoDB
	createUser, err := db.Collection("users").InsertOne(context.Background(), user)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString("Failed to insert user")
	}

	// Convert InsertedID to primitive.ObjectID
	objectID, ok := createUser.InsertedID.(primitive.ObjectID)
	if !ok {
		return c.Status(http.StatusInternalServerError).SendString("Failed to convert InsertedID")
	}

	token, err := utils.GenerateToken(objectID)
	if err != nil {
		return c.Status(500).SendString("Failed to create token")
	}

	return c.JSON(fiber.Map{
		"token": token,
	})
}

func Login(c *fiber.Ctx) error {
	db := database.Db
	input := new(struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	})

	if err := c.BodyParser(input); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "Invalid input",
		})
	}

	// Find the user by the provided email
	var user models.User
	filter := bson.M{"email": input.Email}
	if err := db.Collection("users").FindOne(context.Background(), filter).Decode(&user); err != nil {
		return c.Status(401).JSON(fiber.Map{
			"message": "Invalid email or password",
		})
	}

	// Check if the provided password matches the user's password
	if !utils.CheckPasswordHash(input.Password, user.Password) {
		return c.Status(401).JSON(fiber.Map{
			"message": "Invalid email or password",
		})
	}

	token, err := utils.GenerateToken(user.ID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to generate token",
		})
	}

	// Hide sensitive information before returning user data
	user.Password = ""

	return c.JSON(fiber.Map{
		"token": token,
		"user":  user,
	})
}

func UpdateUser(c *fiber.Ctx) error {
	id := c.Params("_id")

	db := database.Db
	var user models.User

	// Find the user by ID
	filter := bson.M{"_id": id}
	err := db.Collection("users").FindOne(context.Background(), filter).Decode(&user)
	if err != nil {
		return c.Status(http.StatusNotFound).SendString("No user found with ID")
	}

	// Parse request body into user struct
	if err := c.BodyParser(&user); err != nil {
		return c.Status(http.StatusInternalServerError).SendString(err.Error())
	}

	// Update user in MongoDB
	update := bson.M{"$set": user}
	_, err = db.Collection("users").UpdateOne(context.Background(), filter, update)
	if err != nil {
		return c.Status(http.StatusInternalServerError).SendString("Failed to update user")
	}

	return c.JSON(user)
}

func DeleteUser(c *fiber.Ctx) error {
	id := c.Params("_id")

	db := database.Db
	var user models.User

	// Find the user by ID
	filter := bson.M{"_id": id}
	err := db.Collection("users").FindOneAndDelete(context.Background(), filter).Decode(&user)
	if err != nil {
		return c.Status(http.StatusNotFound).SendString("No user found with ID")
	}

	return c.SendString("User successfully deleted!")
}
