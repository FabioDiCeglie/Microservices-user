import dotenv from 'dotenv';
import express from 'express';
import { posts } from './utils/fixtures.js';
import { router as user } from './routes/user/auth.js';
import { authenticateToken } from './utils/helpers.js';
import helmet, { crossOriginResourcePolicy } from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

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

// Test endpoint with authentication
app.get('/test/posts', authenticateToken, (req, res) => {
  res.json(posts.filter((p) => p.username === req.user.name));
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
