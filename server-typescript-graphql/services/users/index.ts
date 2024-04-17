import { expressMiddleware } from "@apollo/server/express4";
import bodyParser, { urlencoded } from "body-parser";
import cors from "cors";
import { json } from "express";
import helmet, { crossOriginResourcePolicy } from "helmet";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import morgan from "morgan";
import { app, httpServer, server } from "./server";
import { config } from 'dotenv';
config();

// This line of code is a logging middleware that logs HTTP requests and responses
app.use(morgan("common"));
app.use(cors());
app.use(json());

// This line of code is a security middleware that helps protect the application
// from common vulnerabilities such as cross-site scripting (XSS), content sniffing, clickjacking, etc.
app.use(helmet());

// This line of code sets a Cross-Origin Resource Policy (CORP) header to allow cross-origin requests.
// This middleware helps to prevent attackers
// from exploiting vulnerabilities in the application by sending malicious requests from other domains.
app.use(crossOriginResourcePolicy({ policy: "cross-origin" }));

// This line of code sets up a middleware that parses JSON data in incoming requests and rejects any request that does not
// conform to the JSON syntax. It also limits the request body size to 30MB.
app.use(bodyParser.json({ limit: "30mb", strict: true }));

// This line of code sets up a middleware that parses URL-encoded data in incoming requests and makes it available in
// the req.body property of the request object.
// It also limits the request body size to 30MB and allows nested objects in the URL-encoded data.
app.use(urlencoded({ limit: "30mb", extended: true }));

const startApolloServer = async () => {
  await server.start();
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        let token = req.header("authorization");

        if (!token) {
          return "";
        }

        if (token.startsWith("Bearer ")) {
          token = token.slice(7, token.length).trimStart();
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as unknown as any).user = verified;

        // add token to context
        return { token };
      },
    })
  );

  const port = 6001;
  await new Promise<void>((resolve, reject) => {
    httpServer.on("error", reject);
    mongoose
      .connect(process.env.MONGO_URL as string)
      .then(() => {
        httpServer.listen({ port }, resolve);
      })
      .catch((error) => console.log(`${error} did not connect`));
  });
  console.info(`🚀 Server ready at http://localhost:${port}/graphql`);
};

startApolloServer().catch((e) => {
  console.error(e);
  process.exit(1);
});