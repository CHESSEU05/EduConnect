import { Router } from 'express';

import { getMe, login, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validateRequest } from '../middleware/validate-request.js';
import { asyncHandler } from '../utils/async-handler.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const authRouter = Router();

authRouter.get('/me', asyncHandler(authenticate), asyncHandler(getMe));
authRouter.post('/login', validateRequest({ body: loginSchema }), asyncHandler(login));
authRouter.post('/register', validateRequest({ body: registerSchema }), asyncHandler(register));

export { authRouter };
