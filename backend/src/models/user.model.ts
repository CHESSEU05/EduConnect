import { Schema, model } from "mongoose";

import {
  type IUser,
  type UserModel,
  userRoles,
  userStatuses,
} from "../types/user.js";

const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
const usernamePattern = /^[a-zA-Z0-9_]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema<IUser, UserModel>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required."],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long."],
      maxlength: [50, "First name cannot exceed 50 characters."],
      match: [namePattern, "First name contains unsupported characters."],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required."],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long."],
      maxlength: [50, "Last name cannot exceed 50 characters."],
      match: [namePattern, "Last name contains unsupported characters."],
    },
    username: {
      type: String,
      required: [true, "Username is required."],
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters long."],
      maxlength: [30, "Username cannot exceed 30 characters."],
      match: [
        usernamePattern,
        "Username can contain only letters, numbers, and underscores.",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email cannot exceed 254 characters."],
      match: [emailPattern, "Email must be a valid email address."],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required."],
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required."],
      enum: {
        values: userRoles,
        message: "Role must be student, instructor, or admin.",
      },
    },
    status: {
      type: String,
      required: [true, "Status is required."],
      enum: {
        values: userStatuses,
        message: "Status must be active, inactive, or suspended.",
      },
      default: "active",
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: null,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters."],
      default: null,
    },
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters."],
      default: null,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_document, returnedObject): void => {
        const userObject = returnedObject as Partial<IUser>;

        delete userObject.passwordHash;
      },
    },
  },
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ createdAt: 1 });

export const User = model<IUser, UserModel>("User", userSchema);
