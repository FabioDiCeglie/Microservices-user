import { ApolloServer } from '@apollo/server';
import assert from 'assert';
import bcrypt from 'bcrypt';
import gql from 'graphql-tag';
import { User } from '@/models/user';
import { resolvers } from '..';
import { typeDefs } from '@/services/users/typeDefs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

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

  describe('login', () => {
    test('should return the current user when user is logged in', async () => {
      jest.spyOn(User, 'findOne').mockReturnValueOnce({
        _id: mockObjectId,
        name: 'test-name',
        password: 'test-password',
      } as unknown as any);

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      jest.spyOn(jwt, 'sign').mockReturnValueOnce('' as unknown as any);

      const login = gql`
        query {
          login(email: "fabio@gmail.com", password: "test-password") {
            name
            password
          }
        }
      `;

      const res = await server.executeOperation(
        { query: login },
        { contextValue: () => {} }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.data).toEqual({
        login: {
          name: 'test-name',
          password: '',
        },
      });
    });

    test('should return user does not exist', async () => {
      jest
        .spyOn(User, 'findOne')
        .mockImplementation(() => Promise.resolve(false) as unknown as any);

      const login = gql`
        query {
          login(email: "fabio@gmail.com", password: "test-password") {
            id
            name
          }
        }
      `;

      const res = await server.executeOperation(
        { query: login },
        { contextValue: () => {} }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors).toEqual([
        {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
          locations: [{ column: 3, line: 2 }],
          message: 'User: fabio@gmail.com does not exist',
          path: ['login'],
        },
      ]);
    });

    test('should return an error for an invalid password', async () => {
      jest.spyOn(User, 'findOne').mockReturnValueOnce({
        id: 'test-id',
        firstName: 'test-name',
        password: 'test-password',
      } as unknown as any);

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      const login = gql`
        query {
          login(email: "fabio@gmail.com", password: "test") {
            id
            name
          }
        }
      `;

      const res = await server.executeOperation(
        { query: login },
        { contextValue: () => {} }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors).toEqual([
        {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
          locations: [{ column: 3, line: 2 }],
          message: 'Invalid password!',
          path: ['login'],
        },
      ]);
    });

    test('should return an error from the try->catch', async () => {
      // Mocking User.findOne to simulate an error
      jest
        .spyOn(User, 'findOne')
        .mockRejectedValueOnce(new Error('Database error'));

      const login = gql`
        query {
          login(email: "fabio@gmail.com", password: "test") {
            id
            name
          }
        }
      `;

      const res = await server.executeOperation(
        { query: login },
        { contextValue: () => {} }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors?.length).toBeGreaterThan(0);
      expect(res.body.singleResult.errors).toEqual([
        {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
          locations: [{ column: 3, line: 2 }],
          message: 'Error: Database error',
          path: ['login'],
        },
      ]);
    });
  });

  describe('getuserInformation', () => {
    test('should return User: ${id} does not exist ', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce(false);

      const getUserInformation = gql`
        query {
          user(id: "test-id") {
            name
            password
          }
        }
      `;

      const res = await server.executeOperation(
        { query: getUserInformation },
        { contextValue: { token: 'mocked-token' } }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors).toEqual([
        {
          message: 'User: test-id does not exist',
          locations: [{ line: 2, column: 3 }],
          path: ['user'],
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        },
      ]);
    });

    test('should return error from try->catch ', async () => {
      jest
        .spyOn(User, 'findById')
        .mockRejectedValueOnce(new Error('Database error'));

      const getUserInformation = gql`
        query {
          user(id: "test-id") {
            name
            password
          }
        }
      `;

      const res = await server.executeOperation(
        { query: getUserInformation },
        { contextValue: { token: 'mocked-token' } }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors).toEqual([
        {
          message: 'Error: Database error',
          locations: [{ line: 2, column: 3 }],
          path: ['user'],
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        },
      ]);
    });

    test('should return user information when user is found', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce({
        _id: 'test-id',
        name: 'test-name',
        email: 'test@example.com',
        password: 'test-password',
      });

      const getUserInformation = gql`
        query {
          user(id: "test-id") {
            name
            email
            password
            token
          }
        }
      `;

      const res = await server.executeOperation(
        { query: getUserInformation },
        { contextValue: { token: 'mocked-token' } }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.data).toEqual({
        user: {
          name: 'test-name',
          email: 'test@example.com',
          password: '',
          token: 'mocked-token',
        },
      });
    });

    test('should return user is not authenticated when context value is empty', async () => {
      jest.spyOn(User, 'findById').mockResolvedValueOnce({
        _id: 'test-id',
        name: 'test-name',
        email: 'test@example.com',
        password: 'test-password',
      });

      const getUserInformation = gql`
        query {
          user(id: "test-id") {
            name
            password
          }
        }
      `;

      const res = await server.executeOperation(
        { query: getUserInformation },
        { contextValue: () => {} }
      );

      assert(res.body.kind === 'single');
      expect(res.body.singleResult.errors).toEqual([
        {
          message: 'User is not authenticated',
          locations: [{ line: 2, column: 3 }],
          path: ['user'],
          extensions: { code: 'UNAUTHENTICATED' },
        },
      ]);
    });
  });
});
