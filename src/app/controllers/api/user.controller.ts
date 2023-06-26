import { ApiUseTag, Context, Delete, Get, HttpResponseNotFound, HttpResponseOK, Patch, Post, ValidateBody, ValidatePathParam, ValidateQueryParam, hashPassword } from '@foal/core';
import { JWTRequired } from '@foal/jwt';
import { User } from '../../entities';
import { AdminRequired, StaffRequired } from '../../hooks';

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

  @Patch("/changePassword")
  @ValidateBody({
    additionalProperties: false,
    properties: {
      password: { type: 'string' }
    },
    required: ['password'],
    type: 'object'
  })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  async changePassword(ctx: Context<User>) {

    const user = await User.findOneBy({ id: ctx.user.id });

    const newPassword = await hashPassword(ctx.request.body.password);

    user!.password = newPassword;
    await user?.save();

    return new HttpResponseOK();

  }

  @Patch("/me")
  @ValidateBody({
    additionalProperties: false,
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' }
    },
    required: [],
    type: 'object'
  })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  async changeDetails(ctx: Context<User>) {

    let options = {};
    if (ctx.request.body.firstName !== undefined) {
      options['firstName'] = ctx.request.body.firstName;
    }
    if (ctx.request.body.lastName !== undefined) {
      options['lastName'] = ctx.request.body.lastName;
    }
    if (ctx.request.body.email !== undefined) {
      options['email'] = ctx.request.body.email;
    }
    await User.createQueryBuilder("user").update(User)
      .set(options)
      .where("id = :id", { id: ctx.user.id })
      .execute();

    return new HttpResponseOK();

  }

  @Post("/:userId/ban")
  @ValidatePathParam("userId", { type: 'number' })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  @AdminRequired()
  async banUser(ctx: Context<User>, { userId }: { userId: number }) {
    const user = await User.findOneBy({ id: userId });
    if (!user) {
      return new HttpResponseNotFound();
    }
    user.isBanned = true;
    await user.save();
    return new HttpResponseOK();
  }

  @Delete("/:userId/ban")
  @ValidatePathParam("userId", { type: 'number' })
  @JWTRequired({
    cookie: true,
    user: (id: number) => User.findOneBy({ id })
  })
  @AdminRequired()
  async unbanUser(ctx: Context<User>, { userId }: { userId: number }) {
    const user = await User.findOneBy({ id: userId });
    if (!user) {
      return new HttpResponseNotFound();
    }
    user.isBanned = false;
    await user.save();
    return new HttpResponseOK();
  }


}
