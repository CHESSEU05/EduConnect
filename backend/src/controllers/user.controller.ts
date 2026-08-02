import type { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

import { userService } from '../services/user.service.js';
import { AppError } from '../utils/app-error.js';
import type {
  ChangePasswordInput,
  UpdateProfileInput,
} from '../validators/user.validator.js';

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.authenticatedUser) {
    throw new AppError('Authentication is required', 401);
  }

  return req.authenticatedUser.id;
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await userService.getProfile(getAuthenticatedUserId(req));

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user,
    },
  });
};

export const updateProfile = async (
  req: Request<ParamsDictionary, unknown, UpdateProfileInput>,
  res: Response,
): Promise<void> => {
  const user = await userService.updateProfile(
    getAuthenticatedUserId(req),
    req.body,
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user,
    },
  });
};

export const changePassword = async (
  req: Request<ParamsDictionary, unknown, ChangePasswordInput>,
  res: Response,
): Promise<void> => {
  await userService.changePassword(getAuthenticatedUserId(req), req.body);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
};
