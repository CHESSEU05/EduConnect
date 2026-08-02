import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { env } from '../config/env';
import type { ApiError, ApiErrorResponse } from '../types/api';
import { clearStoredAuth, readAccessToken } from '../utils/storage';

export class ApiClientError extends Error {
  public readonly status?: number;

  public readonly fieldErrors?: Record<string, string[]>;

  public constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = error.status;
    this.fieldErrors = error.fieldErrors;
  }
}

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ApiErrorResponse>;

  return candidate.success === false && typeof candidate.message === 'string';
};

const toFieldErrors = (
  errors: ApiErrorResponse['errors'],
): Record<string, string[]> | undefined => {
  if (!errors?.length) {
    return undefined;
  }

  return errors.reduce<Record<string, string[]>>((accumulator, item) => {
    const key = item.path ?? 'root';
    accumulator[key] = [...(accumulator[key] ?? []), item.message];
    return accumulator;
  }, {});
};

const shouldBroadcastUnauthorized = (error: AxiosError): boolean => {
  if (error.response?.status !== 401) {
    return false;
  }

  const url = error.config?.url ?? '';

  return !url.includes('/auth/login') && !url.includes('/auth/register');
};

const normalizeAxiosError = (error: AxiosError): ApiClientError => {
  if (shouldBroadcastUnauthorized(error)) {
    clearStoredAuth();
    window.dispatchEvent(new CustomEvent('educonnect:unauthorized'));
  }

  if (error.response) {
    const responseData = error.response.data;

    if (isApiErrorResponse(responseData)) {
      return new ApiClientError({
        message: responseData.message,
        status: error.response.status,
        fieldErrors: toFieldErrors(responseData.errors),
      });
    }

    return new ApiClientError({
      message: `Request failed with status ${error.response.status}.`,
      status: error.response.status,
    });
  }

  if (error.request) {
    return new ApiClientError({
      message: 'Network error. Please check your connection and try again.',
    });
  }

  return new ApiClientError({
    message: error.message || 'Unexpected API client error.',
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
    const token = readAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

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
      }),
    );
  },
);
