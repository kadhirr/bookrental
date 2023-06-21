import { Hook, HookDecorator, HttpResponseForbidden, HttpResponseUnauthorized } from '@foal/core';
import { UserRole } from '../../types';

export function AdminRequired(): HookDecorator {
  return Hook(async (ctx, services) => {
    if (!ctx.user) {
      return new HttpResponseUnauthorized();
    }
    if (ctx.user.role != UserRole.ADMIN) {
      return new HttpResponseForbidden();
    }
  });
}
