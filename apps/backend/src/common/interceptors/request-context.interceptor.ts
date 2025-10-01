import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestContextMiddleware } from '../middleware/request-context.middleware';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly contextMiddleware: RequestContextMiddleware) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const store = this.contextMiddleware.getStore();
    if (store && request.user?.sub) {
      store.userId = request.user.sub;
    }
    return next.handle().pipe(
      tap(() => {
        /* noop */
      })
    );
  }
}
