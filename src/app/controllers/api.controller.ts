import { ApiInfo, ApiServer, Context, controller, Get, HttpResponseOK } from '@foal/core';
import { AuthController, BookController, UserController } from './api';

@ApiInfo({
  title: 'Book Rental Store API',
  version: '0.0.1'
})
@ApiServer({
  url: '/api'
})
export class ApiController {
  subControllers = [
    controller('/auth', AuthController),
    controller('/book', BookController),
    controller('/user', UserController)
  ];


  @Get('/')
  index(ctx: Context) {
    return new HttpResponseOK('Hello world!');
  }

}
