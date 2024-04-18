import { GraphQLError } from 'graphql';
import { createToken, validateEmail, verifyTokenContext } from './helpers';
import jwt from 'jsonwebtoken';

describe('helpers', () => {

  describe('verifyTokenContext', () => {
    const context = { token: undefined, user: undefined };
    it('throws an error if context token is not provided', () => {
      expect(() => verifyTokenContext(context)).toThrow(GraphQLError);
    });

    it('does not throw an error if context token is provided', () => {
      const context = {
        token: 'someToken',
        user: {
          id: 'test-id',
          name: 'test-name',
          email: 'test-email',
          password: 'test-password',
        },
      };
      expect(() => verifyTokenContext(context)).not.toThrow();
    });
  });

describe('createToken', () => {
    
    jest.spyOn(jwt, 'sign').mockReturnValueOnce('test-token' as unknown as any);
    it('returns a valid JWT token', () => {
      const data = { id: 'test-id', email: 'test-email'  };
      const token = createToken(data);
      expect(typeof token).toBe('string');
    });
  });

  describe('validateEmail', () => {

    it('returns true for a valid email', () => {
      const validEmail = 'test@example.com';
      expect(validateEmail(validEmail)).toBe(true);
    });
  
    it('returns false for an invalid email', () => {
      const invalidEmail = 'invalidemail';
      expect(validateEmail(invalidEmail)).toBe(false);
    });
  });
});
