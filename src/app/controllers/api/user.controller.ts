import { ApiUseTag, Context, Get, HttpResponseNotFound, HttpResponseOK, ValidatePathParam, ValidateQueryParam } from '@foal/core';
import { JWTRequired } from '@foal/jwt';
import { User } from '../../entities';
import { StaffRequired } from '../../hooks';

@ApiUseTag("User")
export class UserController {

  @Get('/me')
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  async getMyProfile(ctx: Context<User>) {
    const user = await User.createQueryBuilder("user")
      .select(["user.id", "user.firstName", "user.lastName", "user.email"])
      .leftJoinAndSelect("user.rentedBooks", "bookCopy")
      .leftJoinAndSelect("bookCopy.book", "book")
      .leftJoinAndSelect("bookCopy.transaction", "transaction")
      .where("user.id = :userId", { userId: ctx.user.id })
      .getOne()
    console.log(user);

    if (!user) {
      return new HttpResponseNotFound()
    }
    return new HttpResponseOK(user);
  }

  @Get('/:userId')
  @ValidatePathParam("userId", { type: "number" })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  @StaffRequired()
  async getUserProfile(ctx: Context<User>, { userId }: { userId: number }) {
    const user = await User.createQueryBuilder("user")
      .select(["user.id", "user.firstName", "user.lastName", "user.email"])
      .leftJoinAndSelect("user.rentedBooks", "bookCopy")
      .leftJoinAndSelect("bookCopy.book", "book")
      .leftJoinAndSelect("bookCopy.transaction", "transaction")
      .where("user.id = :userId", { userId })
      .getOne()
    if (!user) {
      return new HttpResponseNotFound()
    }
    return new HttpResponseOK(user);
  }

  @Get("/")
  @ValidateQueryParam("email", { type: "string" }, { required: true })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  @StaffRequired()
  async getUserWithEmail(ctx: Context<User>) {
    const user = await User.createQueryBuilder("user")
      .select(["user.id", "user.firstName", "user.lastName", "user.email"])
      .leftJoinAndSelect("user.rentedBooks", "bookCopy")
      .leftJoinAndSelect("bookCopy.book", "book")
      .leftJoinAndSelect("bookCopy.transaction", "transaction")
      .where("user.email = :userEmail", { userEmail: ctx.request.query.email })
      .getOne()
    if (!user) {
      return new HttpResponseNotFound()
    }
    return new HttpResponseOK(user);
  }



}
