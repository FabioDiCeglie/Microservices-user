package utils

import (
	"time"

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
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // Token expiration time
	})

	// Sign the token with your secret key
	tokenString, err := token.SignedString([]byte("secret-key"))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func AuthMiddleware(c *fiber.Ctx) error {

	tokenString := c.Get("Authorization")

	// Parse and verify the JWT
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte("secret-key"), nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).SendString("Unauthorized")
	}

	// Extract the user ID from the token claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).SendString("Unauthorized")
	}

	userID := int(claims["user_id"].(float64)) // Assuming user_id is stored as a number in the token

	// Set the user ID in the request context for further use in route handlers
	c.Locals("user_id", userID)

	// Continue to the next middleware or route handler
	return c.Next()
}
