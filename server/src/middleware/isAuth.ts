import { verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import MyContext from "../types/MyContext";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  //format: bearer token
  const auth = context.req.headers["authorization"];

  if (!auth) {
    throw new Error("not authenticated");
  }

  try {
    const token = auth.split(" ")[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET as string);

    context.payload = payload as any;
  } catch (error) {
    console.error(error);
    throw new Error("not authenticated");
  }

  return next();
};
