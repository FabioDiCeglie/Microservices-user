import { GraphQLError } from 'graphql';
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
