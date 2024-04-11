import bcrypt, { genSalt, hash } from 'bcrypt';
import { createToken, validateEmail } from '../utils/helpers.js';
import { User } from '../models/user.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: req.body.email });

    if (!user)
      return res.status(400).send({
        message: 'User with that email not found',
      });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ msg: `Invalid password!` });

    const token = createToken({ name: user.name, email: user.email });

    return res
      .status(200)
      .send({
        token,
        user: { id: user._id, email: user.email, name: user.name },
      });
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
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(400).send('An account with this email already exists.');
    }

    const salt = await genSalt();
    const passwordHash = await hash(password, salt);

    const newUser = await new User({
      name,
      email,
      password: passwordHash,
    }).save();

    const token = createToken({ name: newUser.name, email: newUser.email });
    return res
      .status(201)
      .send({ token, user: { id: newUser._id, email: newUser.email } });
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const getUserInformation = async (req, res) => {
  const user = await User.findOne({ email: req.user.email });

  // don't send back the password hash
  delete user.dataValues['password'];
  res.status(200).send({ user });
};
