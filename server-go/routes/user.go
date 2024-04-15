package routes

import (
	"microservice-login/controllers/users"
	"microservice-login/utils"

	"github.com/gofiber/fiber/v2"
)

const apiUrlUser = "/api/v1/auth"

func SetUpRoutes(app *fiber.App) {
	app.Get(apiUrlUser+"/me", users.GetUserInformation)
	app.Post(apiUrlUser+"/signup", users.SignUp)
	app.Post(apiUrlUser+"/login", users.Login)
	app.Delete(apiUrlUser+"/:_id", utils.AuthMiddleware, users.DeleteUser)
	app.Put(apiUrlUser+"/:_id", utils.AuthMiddleware, users.UpdateUser)
}
