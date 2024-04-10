import dotenv from 'dotenv';
import express from 'express';
import { posts } from './utils/fixtures.js';
import { router as user } from './routes/auth.js';
import { authenticateToken } from './utils/helpers.js';

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json([
    {
      test: 'working',
    },
  ]);
});

app.get('/test/posts', authenticateToken, (req, res) => {
  res.json(posts.filter((p) => p.username === req.user.email));
});

app.use('/auth', user);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
