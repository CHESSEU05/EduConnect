import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type {
  ChangePasswordRequest,
  ProfileUser,
  UpdateProfileRequest,
} from '../types/user';

export const getProfileRequest = async (): Promise<ProfileUser> => {
  const response = await apiClient.get<ApiResponse<{ user: ProfileUser }>>(
    '/users/profile',
  );

  return response.data.data.user;
};

export const updateProfileRequest = async (
  input: UpdateProfileRequest,
): Promise<ProfileUser> => {
  const response = await apiClient.patch<ApiResponse<{ user: ProfileUser }>>(
    '/users/profile',
    input,
  );

  return response.data.data.user;
};

export const changePasswordRequest = async (
  input: ChangePasswordRequest,
): Promise<void> => {
  await apiClient.patch<ApiResponse<null>>('/users/change-password', input);
};
