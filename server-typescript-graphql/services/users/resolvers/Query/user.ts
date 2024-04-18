import { User } from '@/models/user';
import { createToken, verifyTokenContext } from '@/utils/helpers';
import { MyContext } from '@/utils/types';
import bcrypt from 'bcrypt';
import { GraphQLError, GraphQLFieldResolver } from 'graphql';

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

    const token = createToken({
      id: user._id.toJSON(),
      email: user.email,
    });

    return { id: user._id , name: user.name, email: user.email, password: '', token };
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
      return new GraphQLError(`User: ${id} does not exist`);
    }

    return { id: user._id , name: user.name, email: user.email, password: '', token: (contextValue as {token: string}).token };
  } catch (err) {
    return new GraphQLError(err as unknown as string);
  }
};
