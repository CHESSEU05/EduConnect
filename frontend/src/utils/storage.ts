import type { AuthUser } from '../types/auth';

export const accessTokenStorageKey = 'educonnect_access_token';
export const userStorageKey = 'educonnect_user';

export const readAccessToken = (): string | null =>
  window.localStorage.getItem(accessTokenStorageKey);

export const writeAccessToken = (token: string): void => {
  window.localStorage.setItem(accessTokenStorageKey, token);
};

export const readStoredUser = (): AuthUser | null => {
  const rawUser = window.localStorage.getItem(userStorageKey);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    window.localStorage.removeItem(userStorageKey);
    return null;
  }
};

export const writeStoredUser = (user: AuthUser): void => {
  window.localStorage.setItem(userStorageKey, JSON.stringify(user));
};

export const clearStoredAuth = (): void => {
  window.localStorage.removeItem(accessTokenStorageKey);
  window.localStorage.removeItem(userStorageKey);
};
