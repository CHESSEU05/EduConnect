import type { UserRole, UserStatus } from './user.js';

declare global {
  namespace Express {
    interface Request {
      authenticatedUser?: {
        id: string;
        email: string;
        role: UserRole;
        status: UserStatus;
      };
    }
  }
}

export {};
