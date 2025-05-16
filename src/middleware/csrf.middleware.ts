import * as csurf from 'csurf';
import * as cookieParser from 'cookie-parser';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (this.isExcludedRoute(req)) {
      next();
    } else {
      const parseCookies = cookieParser();
      parseCookies(req, res, (err: any) => {
        if (err) {
          return next(err);
        }

        const csrfProtection = csurf({
          cookie: {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
          },
          value: (req: Request) => {
            return req.header('csrf-token');
          },
        });
        csrfProtection(req, res, next);
      });
    }
  }

  private isExcludedRoute(req: Request): boolean {
    const excludedPaths = ['/logout'];
    return excludedPaths.includes(req.path);
  }
}
