import type { Request, Response } from 'express';

import { authService } from '../services/auth.service.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js';

export const login = async (
  req: Request<unknown, unknown, LoginInput>,
  res: Response,
): Promise<void> => {
  const data = await authService.login(req.body);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data,
  });
};

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
