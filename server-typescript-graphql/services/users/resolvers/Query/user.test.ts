import { ApolloServer } from "@apollo/server";
import assert from "assert";
import bcrypt from "bcrypt";
import gql from "graphql-tag";
import { User } from "@/models/user";
import { resolvers } from "..";
import { typeDefs } from "@/services/users/typeDefs";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

describe("login", () => {
  let server: ApolloServer;

  beforeAll(() => {
    server = new ApolloServer({
      typeDefs,
      resolvers,
      cache: {
        get: async () => undefined,
        set: async () => {},
        delete: async () => {},
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    server.stop();
    jest.clearAllMocks();
  });

  test("should return the current user when user is logged in", async () => {

    const mockObjectId = new mongoose.Types.ObjectId();

    jest.spyOn(User, "findOne").mockReturnValueOnce({
      _id: mockObjectId,
      name: "test-name",
      password: "test-password",
    } as unknown as any);

    jest
      .spyOn(bcrypt, "compare")
      .mockImplementation(() => Promise.resolve(true));
    
    jest
      .spyOn(jwt, "sign")
      .mockReturnValueOnce("" as unknown as any);

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

    assert(res.body.kind === "single");
    expect(res.body.singleResult.data).toEqual({
      login: {
        name: "test-name",
        password: ''
      },
    });
  });

  test("should return user does not exist", async () => {
    jest
      .spyOn(User, "findOne")
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

    assert(res.body.kind === "single");
    expect(res.body.singleResult.errors).toEqual([
      {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
        locations: [{ column: 3, line: 2 }],
        message: "User: fabio@gmail.com does not exist",
        path: ["login"],
      },
    ]);
  });

  test("should return an error for an invalid password", async () => {
    jest.spyOn(User, "findOne").mockReturnValueOnce({
      id: "test-id",
      firstName: "test-name",
      password: "test-password",
    } as unknown as any);

    jest
      .spyOn(bcrypt, "compare")
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

    assert(res.body.kind === "single");
    expect(res.body.singleResult.errors).toEqual([
      {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
        locations: [{ column: 3, line: 2 }],
        message: "Invalid password!",
        path: ["login"],
      },
    ]);
  });
});