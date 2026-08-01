import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

type ErrorDetail = {
  message: string;
  path?: string;
};

type ErrorResponse = {
  success: false;
  message: string;
  errors?: ErrorDetail[];
  stack?: string;
};

const formatZodErrors = (error: ZodError): ErrorDetail[] =>
  error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : undefined;

    if (path) {
      return {
        path,
        message: issue.message,
      };
    }

    return {
      message: issue.message,
    };
  });

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Internal server error';
};

const isNamedError = (error: unknown, name: string): error is Error =>
  error instanceof Error && error.name === name;

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: ErrorDetail[] | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = formatZodErrors(error);
  } else if (isNamedError(error, 'CastError')) {
    statusCode = 400;
    message = 'Invalid resource identifier';
  } else if (isNamedError(error, 'ValidationError')) {
    statusCode = 400;
    message = getErrorMessage(error);
  } else if (env.NODE_ENV === 'development') {
    message = getErrorMessage(error);
  }

  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (errors && errors.length > 0) {
    response.errors = errors;
  }

  if (env.NODE_ENV === 'development' && error instanceof Error && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};
