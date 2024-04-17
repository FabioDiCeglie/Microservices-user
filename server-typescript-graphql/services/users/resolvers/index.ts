import { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper/resolverMap";
import { getUserInformation, login } from "./Query/user";
import { signUp, deleteUser } from "./Mutation/user";

export const resolvers: GraphQLResolverMap<unknown> = {
  Query: {
    user: getUserInformation,
    login: login,
  },
  Mutation:{
    signUp: signUp,
    deleteUser: deleteUser
  }
};