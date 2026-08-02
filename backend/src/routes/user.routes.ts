import { Router } from 'express';

import {
  changePassword,
  getProfile,
  updateProfile,
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validate-request.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  changePasswordSchema,
  updateProfileSchema,
} from '../validators/user.validator.js';

const userRouter = Router();

userRouter.get('/profile', asyncHandler(authenticate), asyncHandler(getProfile));
userRouter.patch(
  '/profile',
  asyncHandler(authenticate),
  validateRequest({ body: updateProfileSchema }),
  asyncHandler(updateProfile),
);
userRouter.patch(
  '/change-password',
  asyncHandler(authenticate),
  validateRequest({ body: changePasswordSchema }),
  asyncHandler(changePassword),
);

export { userRouter };
