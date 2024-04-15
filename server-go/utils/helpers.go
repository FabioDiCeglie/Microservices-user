package utils

import (
	"os"
	"time"

	"microservice-login/database"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

// CheckPasswordHash compares a plain text password with a hashed password
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateToken(userID primitive.ObjectID) (string, error) {
	database.LoadEnv()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // Token expiration time
	})

	// Sign the token with your secret key
	tokenString, err := token.SignedString([]byte(os.Getenv("ACCESS_TOKEN_SECRET")))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func AuthMiddleware(c *fiber.Ctx) error {
	database.LoadEnv()

	tokenString := c.Get("Authorization")

	// Remove "Bearer " prefix from the token string
	tokenString = tokenString[len("Bearer "):]

	// Parse and verify the JWT
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("ACCESS_TOKEN_SECRET")), nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).SendString("Unauthorized")
	}

	// Extract the user ID from the token claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).SendString("Unauthorized")
	}

	// Extract user ID from claims and convert it to ObjectId
	userIDHex, ok := claims["user_id"].(string)
	if !ok {
		return c.Status(401).SendString("Invalid user ID format")
	}

	userID, err := primitive.ObjectIDFromHex(userIDHex)
	if err != nil {
		return c.Status(401).SendString("Invalid user ID format")
	}

	// Set the user ID in the request context for further use in route handlers
	c.Locals("user_id", userID)

	// Continue to the next middleware or route handler
	return c.Next()
}
