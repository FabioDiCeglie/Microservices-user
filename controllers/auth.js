import bcrypt from 'bcrypt';
import { createToken, validateEmail } from '../utils/helpers.js';

export const login = async (req, res) => {
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
};

export const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send('Please provide an email, password and a name');
  }

  if (!validateEmail(email)) {
    return res
      .status(400)
      .send('Please provide a valid a correct email address.');
  }

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).send('An account with this email already exists.');
    }

    const user = await User.create({
      email,
      password: bcrypt.hashSync(password, SALT_ROUNDS),
    });

    const token = createToken(user);
    return res
      .status(201)
      .send({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const getUserInformation = async (req, res) => {
  // don't send back the password hash
//   const user = await User.findOne({
//     where: { id: req.user.id },
//     include: [Bookings],
//   });
  delete user.dataValues['password'];
  res.status(200).send({ user });
};
