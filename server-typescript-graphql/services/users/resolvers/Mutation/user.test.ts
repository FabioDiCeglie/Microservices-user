import { ApolloServer } from '@apollo/server';
import assert from 'assert';
import bcrypt from 'bcrypt';
import gql from 'graphql-tag';
import { User } from '@/models/user';
import { resolvers } from '..';
import { typeDefs } from '@/services/users/typeDefs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MyContext } from '@/utils/types';

describe('user', () => {
  let server: ApolloServer;
  const mockObjectId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      cache: {
        get: async () => undefined,
        set: async () => {},
        delete: async () => {},
      },
    });
    await server.start();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    jest.clearAllMocks();
    await server.stop();
  });

  describe('signUp', () => {
    test('signUp - creates a new user and returns user data with token when all inputs are valid', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(undefined);

      jest.spyOn(User, 'create').mockResolvedValueOnce({
        _id: mockObjectId,
        name: 'test-user',
        email: 'test-email',
        password: 'fakeHash',
      } as unknown as any);
      jest.spyOn(User.prototype, 'save').mockResolvedValueOnce({
        _id: mockObjectId,
        name: 'test-user',
        email: 'test-email',
        password: 'fakeHash',
      });

      jest.spyOn(bcrypt, 'genSalt').mockImplementation(() => 'fakeSalt');
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => 'fakeHash');
      jest.spyOn(jwt, 'sign').mockImplementation(() => 'fakeToken');

      const signUp = gql`
        mutation {
          signUp(
            name: "test-user"
            email: "test-email@gmail.com"
            password: "test-password"
          ) {
            name
            password
            token
          }
        }
      `;

      const res = await server.executeOperation(
        { query: signUp },
        { contextValue: () => {} }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.data).toEqual({
        signUp: {
          name: 'test-user',
          password: '',
          token: 'fakeToken',
        },
      });
    });

    it('signUp - return an error when args -> email-password-name are empty', async () => {
      const signUp = gql`
        mutation {
          signUp(
            name: ""
            email: "test-email@gmail.com"
            password: "test-password"
          ) {
            name
            password
            token
          }
        }
      `;

      const res = await server.executeOperation(
        { query: signUp },
        { contextValue: () => {} }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors).toEqual([
        {
          message: 'Please provide an email, password and a name',
          locations: [{ line: 2, column: 3 }],
          path: ['signUp'],
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        },
      ]);
    });

    it('signUp - return an error when email is not valid', async () => {
      const signUp = gql`
        mutation {
          signUp(
            name: "test-name"
            email: "test-email"
            password: "test-password"
          ) {
            name
            password
            token
          }
        }
      `;

      const res = await server.executeOperation(
        { query: signUp },
        { contextValue: () => {} }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors).toEqual([
        {
          message: 'Please provide a valid a correct email address.',
          locations: [{ line: 2, column: 3 }],
          path: ['signUp'],
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        },
      ]);
    });

    test('signUp - return an error if the user already exist', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValueOnce({
        _id: mockObjectId,
        name: 'test-user',
        email: 'test-email@gmail.com',
        password: 'fakeHash',
      } as unknown as any);

      const signUp = gql`
        mutation {
          signUp(
            name: "test-user"
            email: "test-email@gmail.com"
            password: "test-password"
          ) {
            name
            password
            token
          }
        }
      `;

      const res = await server.executeOperation(
        { query: signUp },
        { contextValue: () => {} }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors).toEqual([
        {
          message: 'An account with this email already exists.',
          locations: [{ line: 2, column: 3 }],
          path: ['signUp'],
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        },
      ]);
    });

    test('signUp - return an error from the try->catch', async () => {
      jest
        .spyOn(User, 'findOne')
        .mockRejectedValueOnce(new Error('Database error'));

      const signUp = gql`
        mutation {
          signUp(
            name: "test-user"
            email: "test-email@gmail.com"
            password: "test-password"
          ) {
            name
            password
            token
          }
        }
      `;

      const res = await server.executeOperation(
        { query: signUp },
        { contextValue: () => {} }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors?.length).toBeGreaterThan(0);
      expect(res.body.singleResult.errors).toEqual([
        {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
          locations: [{ column: 3, line: 2 }],
          message: 'Error: Database error',
          path: ['signUp'],
        },
      ]);
    });
  });

  describe('deleteUser', () => {
    test('delete user when are inputs are valid', async () => {
      User.findOne = jest.fn().mockImplementationOnce(() => ({
        deleteOne: jest.fn().mockResolvedValueOnce(() => {}),
      }));

      const deleteUser = gql`
        mutation {
          deleteUser(id: "test-id", email: "test-email@gmail.com")
        }
      `;

      const res = await server.executeOperation(
        { query: deleteUser },
        { contextValue: { user: { id: 'test-id' }, token: 'mocked-token' } }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.data).toEqual({
        deleteUser: 'Deleted user succesfull',
      });
    });

    test('delete user - return you are not authorized if the args id is not the same as the context', async () => {
      const deleteUser = gql`
        mutation {
          deleteUser(id: "test-id", email: "test-emailmail.com")
        }
      `;

      const res = await server.executeOperation(
        { query: deleteUser },
        { contextValue: { user: { id: 'tes' }, token: 'mocked-token' } }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors).toEqual([
        {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
          locations: [{ column: 3, line: 2 }],
          message: 'Please provide a valid a correct email address.',
          path: ['deleteUser'],
        },
      ]);
    });

    test('delete user - return an error from the try->catch', async () => {
      jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const deleteUser = gql`
        mutation {
          deleteUser(id: "test-id", email: "test-email@gmail.com")
        }
      `;

      const res = await server.executeOperation(
        { query: deleteUser },
        { contextValue: { user: { id: 'test-id' }, token: 'mocked-token' } }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors?.length).toBeGreaterThan(0);
      expect(res.body.singleResult.errors).toEqual([
        {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
          locations: [{ column: 3, line: 2 }],
          message: 'Error: Database error',
          path: ['deleteUser'],
        },
      ]);
    });

    test('delete user -  return invalid email or id error', async () => {
      const deleteUser = gql`
        mutation {
          deleteUser(id: "", email: "test-email@gmail.com")
        }
      `;

      const res = await server.executeOperation(
        { query: deleteUser },
        { contextValue: { user: { id: 'test-id' }, token: 'mocked-token' } }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors).toEqual([
        {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
          locations: [{ column: 3, line: 2 }],
          message: 'Invalid email or id!',
          path: ['deleteUser'],
        },
      ]);
    });

    test('delete user - return please provide a valid a correct email address if the email is not valid', async () => {
      const deleteUser = gql`
        mutation {
          deleteUser(id: "test-id", email: "test-emailmail.com")
        }
      `;

      const res = await server.executeOperation(
        { query: deleteUser },
        { contextValue: { user: { id: 'test-id' }, token: 'mocked-token' } }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors).toEqual([
        {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
          locations: [{ column: 3, line: 2 }],
          message: 'Please provide a valid a correct email address.',
          path: ['deleteUser'],
        },
      ]);
    });

    test('delete user - return You are not authorized if arg id !== context.user.id', async () => {
        const deleteUser = gql`
          mutation {
            deleteUser(id: "test-id", email: "test-email@gmail.com")
          }
        `;
  
        const res = await server.executeOperation(
          { query: deleteUser },
          { contextValue: { user: { id: 'test-' }, token: 'mocked-token' } }
        );
  
        assert(res.body.kind === 'single');
        expect(res.body.singleResult.errors).toEqual([
          {
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
            locations: [{ column: 3, line: 2 }],
            message: 'You are not authorized!',
            path: ['deleteUser'],
          },
        ]);
      });
  });
});
