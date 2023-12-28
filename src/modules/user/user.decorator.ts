import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from './user.entity';

export const GetUser = createParamDecorator((query: keyof User, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();
  return request['user'];
});
