import { GraphQLResolverMap } from "@apollo/subgraph/dist/schema-helper/resolverMap";
import { getUserInformation, login } from "./Query/user";

export const resolvers: GraphQLResolverMap<unknown> = {
  Query: {
    user: getUserInformation,
    login: login,
  },
};