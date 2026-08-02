import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { Category } from '../types/course';

export const listCategoriesRequest = async (): Promise<Category[]> => {
  const response = await apiClient.get<ApiResponse<{ categories: Category[] }>>(
    '/categories',
  );

  return response.data.data.categories;
};
