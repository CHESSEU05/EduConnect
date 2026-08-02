export type ApiResponse<TData> = {
  success: true;
  message: string;
  data: TData;
};

export type ApiErrorItem = {
  message: string;
  path?: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: ApiErrorItem[];
};

export type ApiError = {
  message: string;
  status?: number;
  fieldErrors?: Record<string, string[]>;
};

export type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
