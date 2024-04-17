import bcrypt from 'bcrypt';
import { GraphQLError, GraphQLFieldResolver } from 'graphql';
import jwt from 'jsonwebtoken';
import { User } from '@/models/user';
import { verifyTokenContext } from '@/utils/helpers';
import { MyContext } from '@/utils/types';

export const login: GraphQLFieldResolver<any, unknown> = async (
  _: unknown,
  args: {
    email: string;
    password: string;
  }
) => {
  try {
    const { email, password } = args;

    const user = await User.findOne({ email });
    if (!user) return new GraphQLError(`User: ${email} does not exist`);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return new GraphQLError(`Invalid password!`);

    const token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET as string);

    return { id: user._id , name: user.name, email: user.email, password: '', token};
  } catch (err) {
    return new GraphQLError(err as unknown as string);
  }
};

export const getUserInformation = async (
  _: unknown,
  args: { id: string },
  contextValue: unknown
) => {
  verifyTokenContext(contextValue as MyContext);
  try {
    const { id } = args;

    const user = await User.findById(id);

    if (!user) {
      return new GraphQLError(`User: ${user} does not exist`);
    }

    return user;
  } catch (err) {
    return new GraphQLError(err as unknown as string);
  }
};
