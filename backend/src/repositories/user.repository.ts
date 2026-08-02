import type { UpdateQuery } from "mongoose";

import { User } from "../models/user.model.js";
import type { IUser, UserDocument } from "../types/user.js";

type CreateUserInput = Omit<IUser, "createdAt" | "updatedAt">;

type UpdateUserInput = Partial<
  Pick<
    IUser,
    | "avatarUrl"
    | "bio"
    | "email"
    | "firstName"
    | "lastName"
    | "phoneNumber"
    | "role"
    | "status"
    | "username"
  >
>;

type UpdateProfileInput = Partial<
  Pick<
    IUser,
    "avatarUrl" | "bio" | "firstName" | "lastName" | "phoneNumber" | "username"
  >
>;

type UserExistsFilter = Partial<
  Pick<IUser, "email" | "role" | "status" | "username">
> & {
  _id?: string;
};

export class UserRepository {
  public async create(input: CreateUserInput): Promise<UserDocument> {
    return User.create(input);
  }

  public async findById(userId: string): Promise<UserDocument | null> {
    return User.findById(userId).exec();
  }

  public async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  public async findByUsername(username: string): Promise<UserDocument | null> {
    return User.findOne({ username: username.toLowerCase().trim() }).exec();
  }

  public async findByEmailOrUsernameWithPasswordHash(
    identifier: string,
  ): Promise<UserDocument | null> {
    const normalizedIdentifier = identifier.toLowerCase().trim();

    return User.findOne({
      $or: [
        { email: normalizedIdentifier },
        { username: normalizedIdentifier },
      ],
    })
      .select('+passwordHash')
      .exec();
  }

  public async findByIdWithPasswordHash(
    userId: string,
  ): Promise<UserDocument | null> {
    return User.findById(userId).select("+passwordHash").exec();
  }

  public async exists(filter: UserExistsFilter): Promise<boolean> {
    const result = await User.exists(filter).exec();

    return result !== null;
  }

  public async update(
    userId: string,
    input: UpdateUserInput,
  ): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(userId, input, {
      new: true,
      runValidators: true,
    }).exec();
  }

  public async updateProfile(
    userId: string,
    input: UpdateProfileInput,
  ): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(userId, input, {
      new: true,
      runValidators: true,
    }).exec();
  }

  public async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<UserDocument | null> {
    return User.findByIdAndUpdate(
      userId,
      {
        $set: {
          passwordHash,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).exec();
  }

  public async delete(userId: string): Promise<UserDocument | null> {
    return User.findByIdAndDelete(userId).exec();
  }

  public async updateLastLogin(userId: string): Promise<UserDocument | null> {
    const update: UpdateQuery<IUser> = {
      $set: {
        lastLoginAt: new Date(),
      },
    };

    return User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).exec();
  }
}

export const userRepository = new UserRepository();
