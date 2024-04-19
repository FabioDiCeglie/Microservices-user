import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet, { crossOriginResourcePolicy } from 'helmet';
import mongoose from 'mongoose';
import morgan from "morgan";
import { router as user } from './routes/user/auth.js';

dotenv.config();

const app = express();

// This line of code is a logging middleware that logs HTTP requests and responses
app.use(morgan("common"));
app.use(express.json());

app.use(cors());

// This line of code is a security middleware that helps protect the application
// from common vulnerabilities such as cross-site scripting (XSS), content sniffing, clickjacking, etc.
app.use(helmet());

// This line of code sets a Cross-Origin Resource Policy (CORP) header to allow cross-origin requests.
// This middleware helps to prevent attackers
// from exploiting vulnerabilities in the application by sending malicious requests from other domains.
app.use(crossOriginResourcePolicy({ policy: 'cross-origin' }));

app.get('/healthcheck', (req, res) => {
  res.json([
    {
			status:  "success",
			message: "Welcome to NodeJS microservice login",
		}
  ]);
});

app.use('/auth', user);

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log(`${error} did not connect`));
