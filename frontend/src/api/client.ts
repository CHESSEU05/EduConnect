import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { env } from '../config/env';
import type { ApiError, ApiErrorResponse } from '../types/api';
import {
  clearStoredAuth,
  readAccessToken,
  writeAccessToken,
  writeStoredUser,
} from '../utils/storage';

type EduConnectAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshSessionResponse = {
  success: true;
  data: {
    accessToken: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      username: string;
      email: string;
      role: 'student' | 'instructor' | 'admin';
      status: 'active' | 'inactive' | 'suspended';
      lastLoginAt?: string;
      createdAt?: string;
      updatedAt?: string;
    };
  };
};

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

  return (
    !url.includes('/auth/login') &&
    !url.includes('/auth/register') &&
    !url.includes('/auth/refresh') &&
    !url.includes('/auth/logout')
  );
};

const shouldAttemptRefresh = (error: AxiosError): boolean => {
  const config = error.config as EduConnectAxiosRequestConfig | undefined;
  const url = config?.url ?? '';

  return (
    error.response?.status === 401 &&
    isApiErrorResponse(error.response.data) &&
    error.response.data.message === 'Access token has expired' &&
    Boolean(config) &&
    config?._retry !== true &&
    !url.includes('/auth/login') &&
    !url.includes('/auth/register') &&
    !url.includes('/auth/refresh') &&
    !url.includes('/auth/logout')
  );
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
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const response = await apiClient.post<RefreshSessionResponse>('/auth/refresh');
  const { accessToken, user } = response.data.data;

  writeAccessToken(accessToken);
  writeStoredUser(user);

  return accessToken;
};

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
  async (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (shouldAttemptRefresh(error)) {
        const originalRequest = error.config as EduConnectAxiosRequestConfig;
        originalRequest._retry = true;

        try {
          refreshPromise ??= refreshAccessToken();
          const accessToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return apiClient(originalRequest);
        } catch (refreshError) {
          clearStoredAuth();
          window.dispatchEvent(new CustomEvent('educonnect:unauthorized'));

          if (axios.isAxiosError(refreshError)) {
            return Promise.reject(normalizeAxiosError(refreshError));
          }

          return Promise.reject(refreshError);
        } finally {
          refreshPromise = null;
        }
      }

      return Promise.reject(normalizeAxiosError(error));
    }

    return Promise.reject(
      new ApiClientError({
        message: 'Unexpected API client error.',
      }),
    );
  },
);
