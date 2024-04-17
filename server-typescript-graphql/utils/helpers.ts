import { GraphQLError } from 'graphql';
import jwt, { Secret } from 'jsonwebtoken';
import { MyContext } from './types';

export const verifyTokenContext = (contextValue: MyContext) => {
  if (!contextValue.token)
    throw new GraphQLError('User is not authenticated', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
};

export const createToken = (data: any) => {
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET  as Secret, { expiresIn: '15m' });
};

export const validateEmail = (email: string) => {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};