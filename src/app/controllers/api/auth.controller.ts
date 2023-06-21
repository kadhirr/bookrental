import { ApiUseTag, Context, Get, HttpResponseForbidden, HttpResponseInternalServerError, HttpResponseNotFound, HttpResponseOK, HttpResponseUnauthorized, Post, ValidateBody, hashPassword, verifyPassword } from '@foal/core';
import { User } from '../../entities';
import { sign } from "jsonwebtoken";
import { getSecretOrPrivateKey, removeAuthCookie, setAuthCookie } from '@foal/jwt';
import { UserRole } from '../../../types';

const credentialsSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string' }
  },
  required: ['email', 'password'],
  additionalProperties: false,
};

const signupSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string' },
    firstName: { type: 'string', maxLength: 30 },
    lastName: { type: 'string', maxLength: 30 }
  },
  required: ['email', 'password', 'firstName', 'lastName'],
  additionalProperties: false,
};


@ApiUseTag("Authentication")
export class AuthController {

  private createNewToken(property, expiry: string): Promise<string> {
    return sign(
      property,
      getSecretOrPrivateKey(),
      { expiresIn: expiry }
    )
  }

  @Post('/login')
  @ValidateBody(credentialsSchema)
  async login(ctx: Context) {
    const user = await User.findOneBy({ email: ctx.request.body.email });

    if (!user) {
      return new HttpResponseNotFound();
    }


    if (!await verifyPassword(ctx.request.body.password, user.password)) {
      return new HttpResponseUnauthorized();
    }

    const token = await this.createNewToken({
      sub: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      email: user.email
    }, '1d')

    const response = new HttpResponseOK();
    setAuthCookie(response, token);

    return response;
  }

  @Post('/signup')
  @ValidateBody(signupSchema)
  async signupUser(ctx: Context) {
    try {
      const user = new User();

      user.firstName = ctx.request.body.firstName;
      user.lastName = ctx.request.body.lastName;
      user.email = ctx.request.body.email;
      user.role = UserRole.USER;
      user.isBanned = false;
      user.password = await hashPassword(ctx.request.body.password);

      await user.save();

      return new HttpResponseOK();
    }
    catch (e: any) {
      console.log(e);
      if (e?.errno == 1062) {
        let error = "Email is already in use!"
        return new HttpResponseForbidden({ error });
      }
      return new HttpResponseInternalServerError({ error: "Internal Server Error" });
    }

  }

  @Post('/logout')
  async logoutUser(ctx: Context) {
    const response = new HttpResponseOK();
    removeAuthCookie(response);
    return response;
  }


}
