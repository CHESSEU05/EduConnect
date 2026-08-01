import { apiClient } from './client';
import type { ApiResponse } from '../types/api';

type HealthResponseData = {
  environment: string;
};

export type HealthResponse = ApiResponse<HealthResponseData>;

export const getHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');

  return response.data;
};
