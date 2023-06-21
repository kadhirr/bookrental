// App
import { hashPassword } from '@foal/core';
import { User } from '../app/entities';
import { dataSource } from '../db';
import { UserRole } from '../types';

export const schema = {
  additionalProperties: false,
  properties: {
    firstName: { type: 'string', maxLength: 255 },
    lastName: { type: 'string', maxLength: 255 },
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string' },
    role: { type: 'number' },
  },
  required: [
    "firstName",
    "lastName",
    "email",
    "password",
    "role"
  ],
  type: 'object',
};

type createUserArgs = {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  role: UserRole
}

export async function main(args: createUserArgs) {
  await dataSource.initialize();

  try {
    const user = new User();

    user.firstName = args.firstName;
    user.lastName = args.lastName;
    user.email = args.email;
    user.password = await hashPassword(args.password);
    user.role = args.role;
    user.isBanned = false;
    console.log(await user.save());
  } catch (error: any) {
    console.error(error.message);
  } finally {
    await dataSource.destroy();
  }
}
