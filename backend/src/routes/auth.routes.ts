import { Router } from 'express';

import { login, register } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate-request.js';
import { asyncHandler } from '../utils/async-handler.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';

const authRouter = Router();

authRouter.post('/login', validateRequest({ body: loginSchema }), asyncHandler(login));
authRouter.post('/register', validateRequest({ body: registerSchema }), asyncHandler(register));

export { authRouter };
