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

    const user = await User.findOne({ email: email });

    if (!user)
      return res.status(400).send({
        message: 'User with that email not found',
      });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ msg: `Invalid password!` });

    const token = createToken({
      _id: user._id,
      name: user.name,
      email: user.email,
    });

    return res.status(200).send({
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

    const token = createToken({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    });
    return res
      .status(201)
      .send({ token, user: { id: newUser._id, email: newUser.email } });
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const getUserInformation = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).lean();

    // don't send back the password hash
    delete user.password;

    res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: 'Something went wrong, sorry' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, password } = req.body;
    if (!id) {
      return res.status(400).send({ message: 'Please provide id' });
    }

    // Check if the user is authorized to update their own account
    if (id !== req.user?.id) {
      return res.status(501).send({ message: 'You are not authorized!' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send({ message: 'User not found!' });
    }

    if (email) {
      if (!validateEmail(email)) {
        return res
          .status(400)
          .send({ message: 'Please provide a valid email address.' });
      }
      user.email = email;
    }

    if (password) {
      const salt = await genSalt();
      const passwordHash = await hash(password, salt);
      user.password = passwordHash;
    }

    if (name) {
      user.name = name;
    }

    await user.save();

    user.password = ''

    res.status(200).send({ user: user, token: req.user.token });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: 'Something went wrong, sorry' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).send({ message: 'Invalid email or id!' });
    }

    if (id !== req.user?.id) {
      return res.status(400).send({ message: 'You are not authorized!' });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: 'Something went wrong, sorry' });
  }
};
