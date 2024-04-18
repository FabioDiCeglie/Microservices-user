import { User } from '@/models/user';
import {
  createToken,
  validateEmail,
  verifyTokenContext,
} from '@/utils/helpers';
import { MyContext } from '@/utils/types';
import { genSalt, hash } from 'bcrypt';
import { GraphQLError, GraphQLFieldResolver } from 'graphql';

export const signUp: GraphQLFieldResolver<any, unknown> = async (
  _: unknown,
  args: {
    name: string;
    email: string;
    password: string;
  }
) => {
  const { name, email, password } = args;
  if (!name || !email || !password) {
    return new GraphQLError('Please provide an email, password and a name');
  }

  if (!validateEmail(email)) {
    return new GraphQLError('Please provide a valid a correct email address.');
  }

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return new GraphQLError('An account with this email already exists.');
    }

    const salt = await genSalt();
    const passwordHash = await hash(password, salt);
    const newUser = await new User({
      name,
      email,
      password: passwordHash,
    }).save();

    const token = createToken({
      id: newUser._id.toJSON(),
      email: newUser.email,
    });

    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      password: '',
      token,
    };
  } catch (error) {
    return new GraphQLError(error as unknown as string);
  }
};

export const deleteUser: GraphQLFieldResolver<any, unknown> = async (
  _: unknown,
  args: {
    id: string;
    email: string;
  },
  context: unknown
) => {
  verifyTokenContext(context as MyContext);

  const { id, email } = args;
  if (!email || !id) {
    return new GraphQLError('Invalid email or id!');
  }

  if (!validateEmail(email)) {
    return new GraphQLError('Please provide a valid a correct email address.');
  }

  if(id !== (context as MyContext).user?.id){
    return new GraphQLError('You are not authorized!');
  }

  try {
    await User.findOne({ email: email }).deleteOne();
    return "Deleted user succesfull"
  } catch (error) {
    return new GraphQLError(error as unknown as string);
  }
};

export const updateUser: GraphQLFieldResolver<any, unknown> = async (
  _: any,
  args: { id: string; email?: string; password?: string; name?: string },
  context: unknown
) => {
  // Verify authentication token
  verifyTokenContext(context as MyContext);

  const { id, email, password, name } = args;
  if (!id) {
    throw new GraphQLError('Invalid id!');
  }

  try {
    // Check if the user is authorized to update their own account
    if (id !== (context as MyContext).user?.id) {
      throw new GraphQLError('You are not authorized!');
    }

    const user = await User.findById(id);

    if (!user) {
      throw new GraphQLError('User not found!');
    }

    if (email) {
      if (!validateEmail(email)) {
        throw new GraphQLError('Please provide a valid email address.');
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

    return { id: user._id , name: user.name, email: user.email, password: '', token: (context as MyContext).token };
  } catch (error) {
    return new GraphQLError(error as unknown as string);
  }
};
