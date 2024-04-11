package users

import (
	"context"
	"microservice-login/database"
	"microservice-login/models"
	"microservice-login/utils"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
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
	db.Create(user)

	token, err := utils.GenerateToken(int(user.ID))
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
	var user database.User
	if err := db.Preload("Flight").Preload("Event").Where("email = ?", input.Email).First(&user).Error; err != nil {
		return c.Status(401).JSON(fiber.Map{
			"message": "Invalid credentials",
		})
	}

	// Check if the provided password matches the user's password
	if !utils.CheckPasswordHash(input.Password, user.Password) {
		return c.Status(401).JSON(fiber.Map{
			"message": "Invalid credentials",
		})
	}

	// Generate a token
	token, err := utils.GenerateToken(int(user.ID))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "Failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user":  user,
	})
}

func UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.Db
	var user models.User
	db.Find(&user, id)
	if user.Name == "" {
		return c.Status(500).SendString("No user found with ID")
	}
	if err := c.BodyParser(&user); err != nil {
		return c.Status(503).SendString(err.Error())
	}
	db.Model(&user).Updates(&user)
	return c.JSON(user)
}

func DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	db := database.Db

	var user models.User
	db.First(&user, id)
	if user.Name == "" {
		return c.Status(500).SendString("No User found with ID")
	}
	db.Delete(&user)
	return c.SendString("User successfully deleted!")
}
