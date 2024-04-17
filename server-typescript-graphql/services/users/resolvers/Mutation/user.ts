import { User } from '@/models/user';
import { createToken, validateEmail } from '@/utils/helpers';
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
    console.log(existingUser)
    const salt = await genSalt();
    const passwordHash = await hash(password, salt);

    const newUser = await new User({
      name,
      email,
      password: passwordHash,
    }).save();

    const token = createToken({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    });

    return { id: newUser._id , name: newUser.name, email: newUser.email, password: '', token };
  } catch (error) {
    return new GraphQLError(error as unknown as string)
  }
};
