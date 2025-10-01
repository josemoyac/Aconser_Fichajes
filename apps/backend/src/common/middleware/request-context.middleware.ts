import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

export interface RequestContextStore {
  requestId: string;
  userId?: string;
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly storage = new AsyncLocalStorage<RequestContextStore>();

  use = (req: Request, res: Response, next: NextFunction): void => {
    const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
    res.setHeader('x-request-id', requestId);
    this.storage.run({ requestId }, () => next());
  };

  getStore(): RequestContextStore | undefined {
    return this.storage.getStore();
  }
}
