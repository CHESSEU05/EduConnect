import type { ICourseModule } from "../types/course.js";

export type SafeUserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
};

export type SafeCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
};

export type LearningModule = {
  id: string;
  title: string;
  description: string | null;
  textContent: string | null;
  videoUrl: string | null;
  resourceUrl: string | null;
  order: number;
  isPreview: boolean;
};

export type PublicModuleMetadata = Pick<
  LearningModule,
  "description" | "id" | "isPreview" | "order" | "title"
>;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getId = (value: unknown): string => {
  if (isRecord(value) && value._id) {
    return String(value._id);
  }

  return String(value);
};

export const getStringField = (
  value: Record<string, unknown>,
  key: string,
): string | null => {
  const fieldValue = value[key];

  return typeof fieldValue === "string" ? fieldValue : null;
};

export const toSafeUserProfile = (value: unknown): SafeUserProfile => {
  if (isRecord(value)) {
    return {
      id: getId(value),
      firstName: getStringField(value, "firstName") ?? "",
      lastName: getStringField(value, "lastName") ?? "",
      username: getStringField(value, "username") ?? "",
      avatarUrl: getStringField(value, "avatarUrl"),
      bio: getStringField(value, "bio"),
    };
  }

  return {
    id: String(value),
    firstName: "",
    lastName: "",
    username: "",
    avatarUrl: null,
    bio: null,
  };
};

export const toSafeCategory = (value: unknown): SafeCategory => {
  if (isRecord(value)) {
    return {
      id: getId(value),
      name: getStringField(value, "name") ?? "",
      slug: getStringField(value, "slug") ?? "",
      description: getStringField(value, "description"),
      icon: getStringField(value, "icon"),
    };
  }

  return {
    id: String(value),
    name: "",
    slug: "",
    description: null,
    icon: null,
  };
};

export const toLearningModule = (module: ICourseModule): LearningModule => ({
  id: module._id?.toString() ?? "",
  title: module.title,
  description: module.description ?? null,
  textContent: module.textContent ?? null,
  videoUrl: module.videoUrl ?? null,
  resourceUrl: module.resourceUrl ?? null,
  order: module.order,
  isPreview: module.isPreview,
});

export const toPublicModuleMetadata = (
  module: ICourseModule,
): PublicModuleMetadata => ({
  id: module._id?.toString() ?? "",
  title: module.title,
  description: module.description ?? null,
  order: module.order,
  isPreview: module.isPreview,
});
