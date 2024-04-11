import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(401).send({ error: 'Authorization header is missing' });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res
      .status(401)
      .send({ error: 'Token is missing in Authorization header' });

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) return res.status(401).send({ error: 'Invalid token' });

      const user = await User.findById(user.id);
      if (!user) {
        return res.status(400).json({ msg: `User: ${user} does not exist` });
      }

      // add user object to request
      req.user = user;
      // next handler
      next();
    });
  } catch (error) {
    switch (error.name) {
      case 'TokenExpiredError':
        return res
          .status(401)
          .send({ error: error.name, message: error.message });

      default:
        return res.status(400).send({
          message: error.message,
        });
    }
  }
};

export const createToken = (data) => {
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};

export const validateEmail = (email) => {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
