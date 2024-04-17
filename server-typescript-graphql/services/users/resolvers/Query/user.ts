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
    const { email: userEmail, password: newPassword } = args;

    const user = await User.findOne({ email: userEmail });
    if (!user) return new GraphQLError(`User: ${userEmail} does not exist`);

    const isMatch = await bcrypt.compare(newPassword, user.password);
    if (!isMatch) return new GraphQLError(`Invalid password!`);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string);

    const { id, name, email } = user;

    return {
      id,
      name,
      email,
      token,
    };
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
