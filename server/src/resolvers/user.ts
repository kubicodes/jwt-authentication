import { compare, hash } from "bcryptjs";
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { User } from "../entity/User";
import { isAuth } from "../middleware/isAuth";
import MyContext from "../types/MyContext";
import { createAccessToken, createRefreshToken } from "../utils/auth";
import { sendRefreshToken } from "../utils/sendRefreshToken";

@ObjectType()
class LoginResponse {
  @Field()
  accessToken: string;
}
@Resolver()
export default class UserResolver {
  @Query(() => [User])
  users() {
    return User.find();
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  auth(@Ctx() { payload }: MyContext) {
    return `you are authenticated with user Id ${payload?.userId}`;
  }

  @Mutation(() => Boolean)
  async register(
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string
  ) {
    const hashedPassword = await hash(password, 12);

    try {
      await User.insert({
        email,
        password: hashedPassword,
      });

      return true;
    } catch (error) {
      console.error(error);

      return false;
    }
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("email", () => String) email: string,
    @Arg("password", () => String) password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const matchedUser = await User.findOne({ where: { email } });

    if (!matchedUser) {
      throw new Error("user does not exist");
    }

    const isValidPassword = await compare(password, matchedUser.password);

    if (!isValidPassword) {
      throw new Error("wrong password");
    }

    //successfully logged in
    sendRefreshToken(res, createRefreshToken(matchedUser));

    return {
      accessToken: createAccessToken(matchedUser),
    };
  }
}
