package main

import (
	"fmt"
	"log"

	"microservice-login/database"
	"microservice-login/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/qinains/fastergoding"
)

func main() {
	fastergoding.Run()
	app := fiber.New()
	app.Use(logger.New())
	database.InitMongoDatabase()

	// Use the cors middleware from gofiber/cors
	app.Use(cors.New(cors.Config{
		AllowHeaders:     "Origin,Content-Type,Accept,Content-Length,Accept-Language,Accept-Encoding,Connection,Access-Control-Allow-Origin,Authorization",
		AllowOrigins:     "*",
		AllowCredentials: true,
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH,OPTIONS",
	}))

	app.Get("/healthcheck", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "Welcome to Go microservice login",
		})
	})

	routes.SetUpRoutes(app)
	fmt.Println("Starting server to http://localhost:4000")

	// Start server
	go func() {
		if err := app.Listen(":4000"); err != nil {
			log.Fatalf("Error starting server: %v", err)
		}
	}()
}
