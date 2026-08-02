import type { Request, Response } from 'express';

import { authService } from '../services/auth.service.js';
import type { RegisterInput } from '../validators/auth.validator.js';

export const register = async (
  req: Request<unknown, unknown, RegisterInput>,
  res: Response,
): Promise<void> => {
  const user = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      user,
    },
  });
};
