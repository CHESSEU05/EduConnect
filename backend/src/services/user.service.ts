import bcrypt from 'bcrypt';

import { env } from '../config/env.js';
import { userRepository, type UserRepository } from '../repositories/user.repository.js';
import type { IUser, UserDocument, UserStatus } from '../types/user.js';
import { AppError } from '../utils/app-error.js';
import {
  getDuplicateKeyField,
  isDuplicateKeyError,
} from '../utils/mongo-errors.js';
import type {
  ChangePasswordInput,
  UpdateProfileInput,
} from '../validators/user.validator.js';

type ProfileResponse = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: IUser['role'];
  status: UserStatus;
  avatarUrl: string | null;
  bio: string | null;
  phoneNumber: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProfileUpdateInput = Partial<
  Pick<
    IUser,
    "avatarUrl" | "bio" | "firstName" | "lastName" | "phoneNumber" | "username"
  >
>;

export class UserService {
  public constructor(private readonly users: UserRepository = userRepository) {}

  public async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new AppError('Profile not found.', 404);
    }

    return this.toProfileResponse(user);
  }

  public async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<ProfileResponse> {
    if (input.username) {
      const existingUser = await this.users.findByUsername(input.username);

      if (existingUser && existingUser._id.toString() !== userId) {
        throw new AppError('This username is already taken', 409);
      }
    }

    const updateInput = this.toProfileUpdateInput(input);

    try {
      const user = await this.users.updateProfile(userId, updateInput);

      if (!user) {
        throw new AppError('Profile not found.', 404);
      }

      return this.toProfileResponse(user);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw this.createDuplicateUsernameConflict(error);
      }

      throw error;
    }
  }

  public async changePassword(
    userId: string,
    input: ChangePasswordInput,
  ): Promise<void> {
    const user = await this.users.findByIdWithPasswordHash(userId);

    if (!user) {
      throw new AppError('Profile not found.', 404);
    }

    const currentPasswordMatches = await bcrypt.compare(
      input.currentPassword,
      user.passwordHash,
    );

    if (!currentPasswordMatches) {
      throw new AppError('Current password is incorrect', 401);
    }

    const newPasswordMatchesCurrent = await bcrypt.compare(
      input.newPassword,
      user.passwordHash,
    );

    if (newPasswordMatchesCurrent) {
      throw new AppError(
        'New password must be different from the current password',
        400,
      );
    }

    const passwordHash = await bcrypt.hash(
      input.newPassword,
      env.BCRYPT_SALT_ROUNDS,
    );

    await this.users.updatePasswordHash(userId, passwordHash);
  }

  private toProfileUpdateInput(input: UpdateProfileInput): ProfileUpdateInput {
    const updateInput: ProfileUpdateInput = {};

    if (input.avatarUrl !== undefined) {
      updateInput.avatarUrl = input.avatarUrl;
    }

    if (input.bio !== undefined) {
      updateInput.bio = input.bio;
    }

    if (input.firstName !== undefined) {
      updateInput.firstName = input.firstName;
    }

    if (input.lastName !== undefined) {
      updateInput.lastName = input.lastName;
    }

    if (input.phoneNumber !== undefined) {
      updateInput.phoneNumber = input.phoneNumber;
    }

    if (input.username !== undefined) {
      updateInput.username = input.username;
    }

    return updateInput;
  }

  private toProfileResponse(user: UserDocument): ProfileResponse {
    return {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl ?? null,
      bio: user.bio ?? null,
      phoneNumber: user.phoneNumber ?? null,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private createDuplicateUsernameConflict(
    error: Parameters<typeof getDuplicateKeyField>[0],
  ): AppError {
    const field = getDuplicateKeyField(error);

    if (field === 'username') {
      return new AppError('This username is already taken', 409);
    }

    return new AppError('Duplicate value already exists.', 409);
  }
}

export const userService = new UserService();
