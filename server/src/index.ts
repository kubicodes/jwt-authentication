import express from "express";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import UserResolver from "./resolvers/user";
import { createConnection } from "typeorm";

(async () => {
  const app = express();

  await createConnection();

  const apolloSever = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
  });

  await apolloSever.start();

  apolloSever.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("express server started");
  });
})();
