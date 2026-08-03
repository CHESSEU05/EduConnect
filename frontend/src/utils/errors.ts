import { ApiClientError } from '../api/client';

export const getFieldErrors = (
  error: unknown,
): Record<string, string[]> | undefined => {
  if (error instanceof ApiClientError) {
    return error.fieldErrors;
  }

  return undefined;
};

export const getDetailedErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (error instanceof ApiClientError) {
    const fieldMessages = Object.values(error.fieldErrors ?? {})
      .flat()
      .filter((message, index, messages) => messages.indexOf(message) === index);

    if (fieldMessages.length > 0) {
      return `${error.message}: ${fieldMessages.join(' ')}`;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
