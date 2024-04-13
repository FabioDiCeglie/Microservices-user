import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { typeDefs } from "./typeDefs";
import http from "http";
import express, { Application } from "express";
import { resolvers } from "./resolvers";
import { ApolloServerPluginInlineTraceDisabled } from "@apollo/server/plugin/disabled";

export const app: Application = express();
export const httpServer = http.createServer(app);

export const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  plugins: [ApolloServerPluginInlineTraceDisabled()],
});