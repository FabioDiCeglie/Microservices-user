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

      const userSaved = await User.findById(user._id);
      if (!userSaved) {
        return res.status(400).json({ msg: `User: ${user} does not exist` });
      }

      // add user and token object to request
      req.user = {id: userSaved._id.toJSON() , email: userSaved.email , token}
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

export const validateEmail = (email) => {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
