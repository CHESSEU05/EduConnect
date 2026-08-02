import type { NextFunction, Request, RequestHandler, Response } from 'express';

import type { UserRole } from '../types/user.js';
import { AppError } from '../utils/app-error.js';

export const authorize =
  (...allowedRoles: UserRole[]): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.authenticatedUser) {
      throw new AppError('Authentication is required', 401);
    }

    if (!allowedRoles.includes(req.authenticatedUser.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }

    next();
  };
