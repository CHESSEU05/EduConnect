import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { authRouter } from './routes/auth.routes.js';
import { categoryRouter } from './routes/category.routes.js';
import { courseRouter } from './routes/course.routes.js';
import { instructorCourseRouter } from './routes/instructor-course.routes.js';
import { instructorDashboardRouter } from './routes/instructor-dashboard.routes.js';
import { studentRouter } from './routes/student.routes.js';
import { userRouter } from './routes/user.routes.js';

const app = express();

const corsOrigin = env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN.split(',');

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
  }),
);
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.URL_ENCODED_BODY_LIMIT }));

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'EduConnect API is running',
    data: {
      environment: env.NODE_ENV,
    },
  });
});

app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
  }),
);

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/students', studentRouter);
app.use('/api/v1/instructor', instructorDashboardRouter);
app.use('/api/v1/instructor/courses', instructorCourseRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
