export type UserRole = 'student' | 'instructor' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type SafeUserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  avatarUrl?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProfileUser = Required<
  Pick<
    SafeUserProfile,
    | 'id'
    | 'firstName'
    | 'lastName'
    | 'username'
    | 'email'
    | 'role'
    | 'status'
    | 'createdAt'
    | 'updatedAt'
  >
> & {
  avatarUrl: string | null;
  bio: string | null;
  phoneNumber: string | null;
  lastLoginAt: string | null;
};

export type UpdateProfileRequest = {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
