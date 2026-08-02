import type { Express } from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import type { CategoryDocument, ICategory } from "../src/types/category.js";
import type { CourseDocument, ICourse } from "../src/types/course.js";

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
  deleteByIdForInstructor: vi.fn(),
  findPublicCourses: vi.fn(),
  countPublicCourses: vi.fn(),
  findPublishedBySlug: vi.fn(),
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
    courses?: Array<{
      slug: string;
      modules?: unknown[];
      moduleCount: number;
      instructor: {
        email?: string;
        status?: string;
        passwordHash?: string;
      };
    }>;
    course?: {
      slug: string;
      modules: Array<{
        isPreview: boolean;
        textContent?: string | null;
        videoUrl?: string | null;
        resourceUrl?: string | null;
      }>;
      instructor: {
        email?: string;
        status?: string;
        passwordHash?: string;
      };
    };
    pagination?: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
};

const categories = categoryRepositoryMock as RepositoryMock<
  typeof categoryRepositoryMock
>;
const courses = courseRepositoryMock as RepositoryMock<typeof courseRepositoryMock>;

const categoryId = "64f1a2b3c4d5e6f789012348";
const instructorId = "64f1a2b3c4d5e6f789012345";

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
      toString: () => "64f1a2b3c4d5e6f789012347",
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
      email: "secret@example.com",
      status: "active",
      passwordHash: "secret",
    },
    level: "beginner",
    language: "English",
    thumbnailUrl: "https://example.com/course.jpg",
    isFree: true,
    price: 0,
    currency: "XAF",
    status: "published",
    modules: [
      {
        _id: {
          toString: () => "64f1a2b3c4d5e6f789012349",
        },
        title: "Preview Module",
        description: "Preview description",
        textContent: "Visible preview text",
        videoUrl: "https://example.com/video",
        resourceUrl: null,
        order: 0,
        isPreview: true,
      },
      {
        _id: {
          toString: () => "64f1a2b3c4d5e6f789012350",
        },
        title: "Private Module",
        description: "Private description",
        textContent: "Hidden private text",
        videoUrl: null,
        resourceUrl: "https://example.com/resource.pdf",
        order: 1,
        isPreview: false,
      },
    ],
    averageRating: 4.5,
    reviewCount: 10,
    enrollmentCount: 100,
    publishedAt: new Date("2026-02-01T00:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  }) as CourseDocument;

describe("public course catalogue", () => {
  let app: Express;

  beforeAll(async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("MONGODB_URI", "mongodb://127.0.0.1:27017/educonnect-test");
    vi.stubEnv(
      "JWT_ACCESS_SECRET",
      "test-access-secret-with-at-least-32-characters",
    );

    ({ app } = await import("../src/app.js"));
  });

  beforeEach(() => {
    vi.clearAllMocks();

    categories.findActiveBySlug.mockResolvedValue(createCategoryDocument());
    courses.findPublicCourses.mockResolvedValue([createCourseDocument()]);
    courses.countPublicCourses.mockResolvedValue(1);
    courses.findPublishedBySlug.mockResolvedValue(createCourseDocument());
  });

  it("returns only published courses from the public repository path", async () => {
    const response = await request(app).get("/api/v1/courses").expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.courses?.map((course) => course.slug)).toEqual([
      "introduction-to-programming",
    ]);
    expect(body.data?.courses?.map((course) => course.slug)).not.toContain(
      "draft-course",
    );
  });

  it("returns pagination metadata", async () => {
    courses.countPublicCourses.mockResolvedValue(25);

    const response = await request(app)
      .get("/api/v1/courses?page=2&limit=12")
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.pagination).toMatchObject({
      page: 2,
      limit: 12,
      totalItems: 25,
      totalPages: 3,
    });
  });

  it("passes trimmed search to the repository", async () => {
    await request(app).get("/api/v1/courses?search=programming").expect(200);

    expect(courses.findPublicCourses).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "programming",
      }),
    );
  });

  it("filters by category slug", async () => {
    await request(app).get("/api/v1/courses?category=programming").expect(200);

    expect(categories.findActiveBySlug).toHaveBeenCalledWith("programming");
    expect(courses.findPublicCourses).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId,
      }),
    );
  });

  it("filters by level", async () => {
    await request(app).get("/api/v1/courses?level=beginner").expect(200);

    expect(courses.findPublicCourses).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "beginner",
      }),
    );
  });

  it("filters free courses", async () => {
    await request(app).get("/api/v1/courses?isFree=true").expect(200);

    expect(courses.findPublicCourses).toHaveBeenCalledWith(
      expect.objectContaining({
        isFree: true,
      }),
    );
  });

  it("filters by price range", async () => {
    await request(app)
      .get("/api/v1/courses?minPrice=1000&maxPrice=20000")
      .expect(200);

    expect(courses.findPublicCourses).toHaveBeenCalledWith(
      expect.objectContaining({
        minPrice: 1000,
        maxPrice: 20000,
      }),
    );
  });

  it("passes sorting", async () => {
    await request(app).get("/api/v1/courses?sort=popular").expect(200);

    expect(courses.findPublicCourses).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: "popular",
      }),
    );
  });

  it("rejects invalid query values", async () => {
    await request(app).get("/api/v1/courses?level=expert").expect(400);
    await request(app).get("/api/v1/courses?isFree=yes").expect(400);
    await request(app).get("/api/v1/courses?minPrice=10&maxPrice=1").expect(400);
  });

  it("excludes full module content from catalogue results", async () => {
    const response = await request(app).get("/api/v1/courses").expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.courses?.[0]?.modules).toBeUndefined();
    expect(body.data?.courses?.[0]?.moduleCount).toBe(2);
  });

  it("public details exposes preview content only", async () => {
    const response = await request(app)
      .get("/api/v1/courses/introduction-to-programming")
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.course?.modules[0]?.textContent).toBe("Visible preview text");
    expect(body.data?.course?.modules[1]?.textContent).toBeUndefined();
    expect(body.data?.course?.modules[1]?.resourceUrl).toBeUndefined();
  });

  it("returns 404 for absent, draft, or archived course details", async () => {
    courses.findPublishedBySlug.mockResolvedValue(null);

    await request(app).get("/api/v1/courses/draft-course").expect(404);
  });

  it("hides instructor confidential fields", async () => {
    const response = await request(app).get("/api/v1/courses").expect(200);
    const body = response.body as ApiResponse;
    const instructor = body.data?.courses?.[0]?.instructor;

    expect(instructor?.email).toBeUndefined();
    expect(instructor?.status).toBeUndefined();
    expect(instructor?.passwordHash).toBeUndefined();
  });
});
