import express from "express";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import UserResolver from "./resolvers/user";
import { createConnection } from "typeorm";
import cors from "cors";
import "dotenv-safe/config";

(async () => {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: "https://studio.apollographql.com",
      credentials: true,
    })
  );

  await createConnection();

  const apolloSever = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  await apolloSever.start();

  apolloSever.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log("express server started");
  });
})();
