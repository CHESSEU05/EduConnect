import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { env } from '../config/env';
import type { ApiErrorResponse, NormalizedApiError } from '../types/api';

export class ApiClientError extends Error {
  public readonly statusCode?: number;

  public readonly errors: string[];

  public constructor(error: NormalizedApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.statusCode = error.statusCode;
    this.errors = error.errors;
  }
}

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ApiErrorResponse>;

  return candidate.success === false && typeof candidate.message === 'string';
};

const normalizeAxiosError = (error: AxiosError): ApiClientError => {
  if (error.response) {
    const responseData = error.response.data;

    if (isApiErrorResponse(responseData)) {
      return new ApiClientError({
        message: responseData.message,
        statusCode: error.response.status,
        errors: responseData.errors?.map((item) => item.message) ?? [],
      });
    }

    return new ApiClientError({
      message: `Request failed with status ${error.response.status}.`,
      statusCode: error.response.status,
      errors: [],
    });
  }

  if (error.request) {
    return new ApiClientError({
      message: 'Network error. Please check your connection and try again.',
      errors: [],
    });
  }

  return new ApiClientError({
    message: error.message || 'Unexpected API client error.',
    errors: [],
  });
};

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Future JWT attachment belongs here once authentication is implemented.
    return config;
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return Promise.reject(normalizeAxiosError(error));
    }

    return Promise.reject(
      new ApiClientError({
        message: 'Unexpected API client error.',
        errors: [],
      }),
    );
  },
);
