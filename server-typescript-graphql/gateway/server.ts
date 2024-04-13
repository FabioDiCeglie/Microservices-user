import {
    ApolloGateway,
    IntrospectAndCompose,
    RemoteGraphQLDataSource,
  } from "@apollo/gateway";
  import { ApolloServer } from "@apollo/server";
  import express, { Application } from "express";
  import http from "http";
  
  export const app: Application = express();
  export const httpServer = http.createServer(app);
  
  class AuthenticatedDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request, context }: any) {
      if (context.authorization) {
        request.http.headers.set("authorization", context.authorization);
      }
    }
  }
  
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: [
        { name: "users", url: "http://localhost:5001/graphql" },
      ],
    }),
    buildService: ({ name, url }) => {
      console.info(`Creating data source for ${name} => ${url}`);
  
      return new AuthenticatedDataSource({ url });
    },
  });
  
  export const server = new ApolloServer({
    gateway,
  });