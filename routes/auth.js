import { Router } from 'express';
import { createToken } from '../utils/helpers.js';
import bcrypt from 'bcrypt';

export const router = new Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ message: 'Please provide both email and password' });
    }

    // Search user in database example
    // const user = await User.findOne({
    //   where: { email },
    // });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(400).send({
        message: 'User with that email not found or password incorrect',
      });
    }

    const token = createToken(user);

    return res.status(200).send({ token, user: { id: 1, email: user.email } });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: 'Something went wrong, sorry' });
  }
});