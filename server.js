import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { posts } from './utils/fixture.js';

dotenv.config();

const app = express();

app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(401).send({error: 'Authorization header is missing'});

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).send({error: 'Token is missing in Authorization header'});

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).send({error: 'You are not authorized!'});
    req.user = user;
    next();
  });
};

app.get('/', (req, res) => {
  res.json([
    {
      test: 'working',
    },
  ]);
});

app.get('/test/posts', authenticateToken, (req, res) => {
  res.json(posts.filter((p) => p.username === req.user.name));
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = {
    name: username,
    password: password,
  };

  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

  res.json({ accessToken: accessToken });
});

console.log('Server started');
app.listen(3000);
