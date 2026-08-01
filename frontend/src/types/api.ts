export type ApiResponse<TData> = {
  success: boolean;
  message?: string;
  data: TData;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: Array<{
    message: string;
    path?: string;
  }>;
};

export type NormalizedApiError = {
  message: string;
  statusCode?: number;
  errors: string[];
};
