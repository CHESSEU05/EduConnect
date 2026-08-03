import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  RegisterResponseData,
} from '../types/auth';
import type { ApiResponse } from '../types/api';

export const loginRequest = async (
  input: LoginRequest,
): Promise<LoginResponseData> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>(
    '/auth/login',
    input,
  );

  return response.data.data;
};

export const registerRequest = async (
  input: RegisterRequest,
): Promise<RegisterResponseData> => {
  const response = await apiClient.post<ApiResponse<RegisterResponseData>>(
    '/auth/register',
    input,
  );

  return response.data.data;
};

export const getCurrentUserRequest = async (): Promise<LoginResponseData['user']> => {
  const response = await apiClient.get<
    ApiResponse<{ user: LoginResponseData['user'] }>
  >('/auth/me');

  return response.data.data.user;
};

export const refreshSessionRequest = async (): Promise<LoginResponseData> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>(
    '/auth/refresh',
  );

  return response.data.data;
};

export const logoutRequest = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};
