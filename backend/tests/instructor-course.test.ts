import type { Express } from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import type { CategoryDocument, ICategory } from "../src/types/category.js";
import type { CourseDocument, ICourse } from "../src/types/course.js";
import type { IUser, UserDocument } from "../src/types/user.js";

const userRepositoryMock = vi.hoisted(() => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByEmailOrUsernameWithPasswordHash: vi.fn(),
  findByIdWithPasswordHash: vi.fn(),
  findByUsername: vi.fn(),
  exists: vi.fn(),
  update: vi.fn(),
  updateProfile: vi.fn(),
  updatePasswordHash: vi.fn(),
  delete: vi.fn(),
  updateLastLogin: vi.fn(),
}));

const categoryRepositoryMock = vi.hoisted(() => ({
  findActive: vi.fn(),
  findActiveBySlug: vi.fn(),
  findById: vi.fn(),
  findActiveById: vi.fn(),
  upsertBySlug: vi.fn(),
}));

const courseRepositoryMock = vi.hoisted(() => ({
  create: vi.fn(),
  existsBySlug: vi.fn(),
  existsBySlugExcludingCourse: vi.fn(),
  findInstructorCourses: vi.fn(),
  countInstructorCourses: vi.fn(),
  findByIdForInstructor: vi.fn(),
  updateByIdForInstructor: vi.fn(),
  publishByIdForInstructor: vi.fn(),
  archiveByIdForInstructor: vi.fn(),
  restoreByIdForInstructor: vi.fn(),
  deleteByIdForInstructor: vi.fn(),
  findPublicCourses: vi.fn(),
  countPublicCourses: vi.fn(),
  findPublishedBySlug: vi.fn(),
}));

vi.mock("../src/repositories/user.repository.js", () => ({
  userRepository: userRepositoryMock,
  UserRepository: class UserRepository {},
}));

vi.mock("../src/repositories/category.repository.js", () => ({
  categoryRepository: categoryRepositoryMock,
  CategoryRepository: class CategoryRepository {},
}));

vi.mock("../src/repositories/course.repository.js", () => ({
  courseRepository: courseRepositoryMock,
  CourseRepository: class CourseRepository {},
}));

type RepositoryMock<T extends Record<string, unknown>> = {
  [Key in keyof T]: Mock;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: {
    course?: {
      id: string;
      slug: string;
      status: string;
      instructor: {
        email?: string;
      };
      modules: Array<{
        order: number;
      }>;
      passwordHash?: string;
    };
    courses?: unknown[];
  };
};

const users = userRepositoryMock as RepositoryMock<typeof userRepositoryMock>;
const categories = categoryRepositoryMock as RepositoryMock<
  typeof categoryRepositoryMock
>;
const courses = courseRepositoryMock as RepositoryMock<typeof courseRepositoryMock>;

const instructorId = "64f1a2b3c4d5e6f789012345";
const studentId = "64f1a2b3c4d5e6f789012346";
const courseId = "64f1a2b3c4d5e6f789012347";
const categoryId = "64f1a2b3c4d5e6f789012348";

const createUserDocument = (
  overrides: Partial<IUser> = {},
  documentId = instructorId,
): UserDocument =>
  ({
    _id: {
      toString: () => documentId,
    },
    firstName: "Amina",
    lastName: "Ndi",
    username: "amina_ndi",
    email: "amina@example.com",
    passwordHash: "$2b$10$hashed-password-value",
    role: "instructor",
    status: "active",
    emailVerified: false,
    avatarUrl: null,
    bio: null,
    phoneNumber: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  }) as UserDocument;

const createCategoryDocument = (
  overrides: Partial<ICategory> = {},
): CategoryDocument =>
  ({
    _id: {
      toString: () => categoryId,
    },
    name: "Programming",
    slug: "programming",
    description: null,
    icon: null,
    isActive: true,
    displayOrder: 0,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  }) as CategoryDocument;

const createCourseDocument = (
  overrides: Partial<ICourse> = {},
): CourseDocument =>
  ({
    _id: {
      toString: () => courseId,
    },
    title: "Introduction to Programming",
    slug: "introduction-to-programming",
    shortDescription: "Learn programming fundamentals with examples.",
    description:
      "This beginner course teaches practical programming foundations for university students and independent learners.",
    category: {
      _id: categoryId,
      name: "Programming",
      slug: "programming",
      description: null,
      icon: null,
    },
    instructor: {
      _id: instructorId,
      firstName: "Amina",
      lastName: "Ndi",
      username: "amina_ndi",
      avatarUrl: null,
      bio: null,
      email: "hidden@example.com",
      passwordHash: "secret",
    },
    level: "beginner",
    language: "English",
    thumbnailUrl: "https://example.com/course.jpg",
    isFree: true,
    price: 0,
    currency: "XAF",
    status: "draft",
    modules: [
      {
        _id: {
          toString: () => "64f1a2b3c4d5e6f789012349",
        },
        title: "Getting Started",
        description: null,
        textContent: "Welcome to the course.",
        videoUrl: null,
        resourceUrl: null,
        order: 0,
        isPreview: true,
      },
    ],
    averageRating: 0,
    reviewCount: 0,
    enrollmentCount: 0,
    publishedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  }) as CourseDocument;

const validPayload = () => ({
  title: "Introduction to Programming",
  shortDescription: "Learn programming fundamentals with examples.",
  description:
    "This beginner course teaches practical programming foundations for university students and independent learners.",
  categoryId,
  level: "beginner",
  language: "English",
  thumbnailUrl: "https://example.com/course.jpg",
  isFree: true,
  price: 0,
  modules: [
    {
      title: "Getting Started",
      textContent: "Welcome to the course.",
      order: 99,
      isPreview: true,
    },
  ],
});

describe("instructor course management", () => {
  let app: Express;
  let instructorToken: string;
  let studentToken: string;

  beforeAll(async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("MONGODB_URI", "mongodb://127.0.0.1:27017/educonnect-test");
    vi.stubEnv("BCRYPT_SALT_ROUNDS", "10");
    vi.stubEnv(
      "JWT_ACCESS_SECRET",
      "test-access-secret-with-at-least-32-characters",
    );
    vi.stubEnv("JWT_ACCESS_EXPIRES_IN", "15m");

    const [{ app: importedApp }, { generateAccessToken }] = await Promise.all([
      import("../src/app.js"),
      import("../src/utils/jwt.js"),
    ]);

    app = importedApp;
    instructorToken = generateAccessToken({
      userId: instructorId,
      email: "instructor@example.com",
      role: "instructor",
    });
    studentToken = generateAccessToken({
      userId: studentId,
      email: "student@example.com",
      role: "student",
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    users.findById.mockResolvedValue(createUserDocument());
    categories.findActiveById.mockResolvedValue(createCategoryDocument());
    courses.existsBySlug.mockResolvedValue(false);
    courses.existsBySlugExcludingCourse.mockResolvedValue(false);
    courses.create.mockResolvedValue(createCourseDocument());
    courses.findInstructorCourses.mockResolvedValue([createCourseDocument()]);
    courses.countInstructorCourses.mockResolvedValue(1);
    courses.findByIdForInstructor.mockResolvedValue(createCourseDocument());
    courses.updateByIdForInstructor.mockResolvedValue(
      createCourseDocument({ title: "Updated Course Title" }),
    );
    courses.publishByIdForInstructor.mockResolvedValue(
      createCourseDocument({
        status: "published",
        publishedAt: new Date("2026-02-01T00:00:00.000Z"),
      }),
    );
    courses.archiveByIdForInstructor.mockResolvedValue(
      createCourseDocument({ status: "archived" }),
    );
    courses.restoreByIdForInstructor.mockResolvedValue(
      createCourseDocument({ status: "draft", publishedAt: null }),
    );
    courses.deleteByIdForInstructor.mockResolvedValue(createCourseDocument());
  });

  it("lets an instructor create a draft course", async () => {
    const response = await request(app)
      .post("/api/v1/instructor/courses")
      .set("Authorization", `Bearer ${instructorToken}`)
      .send(validPayload())
      .expect(201);
    const body = response.body as ApiResponse;

    expect(body.data?.course?.status).toBe("draft");
    const createdCourse = courses.create.mock.calls[0]?.[0] as {
      instructor: { toString(): string };
      status: string;
    };

    expect(createdCourse.instructor.toString()).toBe(instructorId);
    expect(createdCourse.status).toBe("draft");
    expect(body.data?.course?.modules[0]?.order).toBe(0);
  });

  it("rejects a student with 403", async () => {
    users.findById.mockResolvedValue(createUserDocument({ role: "student" }, studentId));

    await request(app)
      .post("/api/v1/instructor/courses")
      .set("Authorization", `Bearer ${studentToken}`)
      .send(validPayload())
      .expect(403);
  });

  it("rejects an unauthenticated request with 401", async () => {
    await request(app)
      .post("/api/v1/instructor/courses")
      .send(validPayload())
      .expect(401);
  });

  it("rejects an inactive category", async () => {
    categories.findActiveById.mockResolvedValue(null);

    await request(app)
      .post("/api/v1/instructor/courses")
      .set("Authorization", `Bearer ${instructorToken}`)
      .send(validPayload())
      .expect(400);
  });

  it("takes ownership from the token, not the body", async () => {
    await request(app)
      .post("/api/v1/instructor/courses")
      .set("Authorization", `Bearer ${instructorToken}`)
      .send(validPayload())
      .expect(201);

    const createdCourse = courses.create.mock.calls[0]?.[0] as {
      instructor: { toString(): string };
    };

    expect(createdCourse.instructor.toString()).toBe(instructorId);
  });

  it("generates a unique slug for duplicate titles", async () => {
    courses.existsBySlug
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await request(app)
      .post("/api/v1/instructor/courses")
      .set("Authorization", `Bearer ${instructorToken}`)
      .send(validPayload())
      .expect(201);

    expect(courses.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "introduction-to-programming-2",
      }),
    );
  });

  it("does not expose passwordHash", async () => {
    const response = await request(app)
      .get(`/api/v1/instructor/courses/${courseId}`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(200);

    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
  });

  it("lets the owner retrieve a private course", async () => {
    const response = await request(app)
      .get(`/api/v1/instructor/courses/${courseId}`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.course?.id).toBe(courseId);
  });

  it("does not reveal a course owned by another instructor", async () => {
    courses.findByIdForInstructor.mockResolvedValue(null);

    await request(app)
      .get(`/api/v1/instructor/courses/${courseId}`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(404);
  });

  it("lets the owner update a course", async () => {
    const response = await request(app)
      .patch(`/api/v1/instructor/courses/${courseId}`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .send({ title: "Updated Course Title" })
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body.message).toBe("Course updated successfully");
  });

  it("rejects unsupported update fields", async () => {
    await request(app)
      .patch(`/api/v1/instructor/courses/${courseId}`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .send({ status: "published" })
      .expect(400);
  });

  it("publishes a valid course", async () => {
    const response = await request(app)
      .patch(`/api/v1/instructor/courses/${courseId}/publish`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.course?.status).toBe("published");
  });

  it("rejects publishing a course without modules", async () => {
    courses.findByIdForInstructor.mockResolvedValue(
      createCourseDocument({ modules: [] }),
    );

    await request(app)
      .patch(`/api/v1/instructor/courses/${courseId}/publish`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(400);
  });

  it("archives a course", async () => {
    const response = await request(app)
      .patch(`/api/v1/instructor/courses/${courseId}/archive`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.course?.status).toBe("archived");
  });

  it("restores an archived course to draft", async () => {
    courses.findByIdForInstructor.mockResolvedValueOnce(
      createCourseDocument({ status: "archived" }),
    );

    const response = await request(app)
      .patch(`/api/v1/instructor/courses/${courseId}/restore`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body.message).toBe("Course restored successfully");
    expect(body.data?.course?.status).toBe("draft");
    expect(courses.restoreByIdForInstructor).toHaveBeenCalledWith(
      courseId,
      instructorId,
    );
  });

  it("rejects restoring a course that is not archived", async () => {
    await request(app)
      .patch(`/api/v1/instructor/courses/${courseId}/restore`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(409);

    expect(courses.restoreByIdForInstructor).not.toHaveBeenCalled();
  });

  it("deletes a draft without enrollments", async () => {
    await request(app)
      .delete(`/api/v1/instructor/courses/${courseId}`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(204);
  });

  it("rejects deleting a published course", async () => {
    courses.findByIdForInstructor.mockResolvedValue(
      createCourseDocument({ status: "published" }),
    );

    await request(app)
      .delete(`/api/v1/instructor/courses/${courseId}`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(409);
  });

  it("rejects deleting an enrolled course", async () => {
    courses.findByIdForInstructor.mockResolvedValue(
      createCourseDocument({ enrollmentCount: 1 }),
    );

    await request(app)
      .delete(`/api/v1/instructor/courses/${courseId}`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(409);
  });
});
