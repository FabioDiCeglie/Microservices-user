import gql from "graphql-tag";
import type { DocumentNode } from "graphql/language/ast";

export const typeDefs: DocumentNode = gql`
  type User {
    id: String!
    name: String!
    email: String!
    password: String!
    token: String
  }

  type Query {
    user(id: String): User
    login(email: String, password: String): User
  }

  type Mutation {
    signUp(name: String, email: String, password: String): User
    deleteUser(id: String, email: String): String
  }
`;