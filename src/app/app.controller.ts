import { controller, IAppController } from '@foal/core';

import { ApiController } from './controllers';
import { OpenApiController } from './controllers/openapi.controller';

export class AppController implements IAppController {
  subControllers = [
    controller('/api', ApiController),
    controller('/swagger', OpenApiController),
  ];
}
