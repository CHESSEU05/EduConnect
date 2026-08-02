import type { HydratedDocument, Model } from "mongoose";

export const userRoles = ["student", "instructor", "admin"] as const;

export const userStatuses = ["active", "inactive", "suspended"] as const;

export type UserRole = (typeof userRoles)[number];

export type UserStatus = (typeof userStatuses)[number];

export interface IUser {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  avatarUrl?: string | null;
  bio?: string | null;
  phoneNumber?: string | null;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

export type UserModel = Model<IUser>;
