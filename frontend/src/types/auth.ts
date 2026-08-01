export type UserRole = 'student' | 'instructor' | 'admin';

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
};

export type LoginPlaceholderInput = {
  user: AuthUser;
  accessToken: string;
};
