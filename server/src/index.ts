import express from "express";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import UserResolver from "./resolvers/user";
import { createConnection } from "typeorm";
import cors from "cors";
import "dotenv-safe/config";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import { User } from "./entity/User";
import { createAccessToken } from "./utils/auth";

(async () => {
  const app = express();

  app.set("trust proxy", 1);

  app.use(cookieParser());

  app.use(
    cors({
      origin: "https://studio.apollographql.com",
      credentials: true,
    })
  );

  app.post("/refresh_token", async (req, res) => {
    const token: string = req.cookies.jid;

    if (!token) {
      res.send({ ok: false, accessToken: "" });
    }

    let payload: any;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      console.error(error);
      res.send({ ok: false, accessToken: "" });
    }

    const user = await User.findOne(payload.userId);

    if (!user) {
      res.send({ ok: false, accessToken: "" });
    }

    res.send({ ok: true, accesToken: createAccessToken(user) });
  });

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
