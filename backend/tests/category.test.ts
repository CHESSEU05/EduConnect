import type { Express } from "express";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import type { CategoryDocument, ICategory } from "../src/types/category.js";

const categoryRepositoryMock = vi.hoisted(() => ({
  findActive: vi.fn(),
  findActiveBySlug: vi.fn(),
  findById: vi.fn(),
  findActiveById: vi.fn(),
  upsertBySlug: vi.fn(),
}));

vi.mock("../src/repositories/category.repository.js", () => ({
  categoryRepository: categoryRepositoryMock,
  CategoryRepository: class CategoryRepository {},
}));

type RepositoryMock = {
  [Key in keyof typeof categoryRepositoryMock]: Mock;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: {
    categories?: Array<{
      name: string;
      slug: string;
      displayOrder: number;
    }>;
  };
};

const repository = categoryRepositoryMock as RepositoryMock;

const createCategoryDocument = (
  overrides: Partial<ICategory> = {},
): CategoryDocument =>
  ({
    _id: {
      toString: () => overrides.slug ?? "programming",
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

describe("categories", () => {
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
  });

  it("seeds categories idempotently", async () => {
    const { CategoryService, defaultCategories } = await import(
      "../src/services/category.service.js"
    );
    let callCount = 0;

    repository.upsertBySlug.mockImplementation((category: ICategory) => {
      callCount += 1;

      return Promise.resolve({
        category: createCategoryDocument(category),
        created: callCount <= 2,
      });
    });

    const service = new CategoryService(repository);
    const result = await service.seedDefaultCategories();

    expect(repository.upsertBySlug).toHaveBeenCalledTimes(defaultCategories.length);
    expect(result).toEqual({
      created: 2,
      updated: defaultCategories.length - 2,
    });
  });

  it("returns active categories in display order", async () => {
    repository.findActive.mockResolvedValue([
      createCategoryDocument({
        name: "Programming",
        slug: "programming",
        displayOrder: 0,
      }),
      createCategoryDocument({
        name: "Design",
        slug: "design",
        displayOrder: 1,
      }),
    ]);

    const response = await request(app).get("/api/v1/categories").expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.categories?.map((category) => category.slug)).toEqual([
      "programming",
      "design",
    ]);
  });

  it("hides inactive categories from public responses", async () => {
    repository.findActive.mockResolvedValue([
      createCategoryDocument({ slug: "programming", isActive: true }),
    ]);

    const response = await request(app).get("/api/v1/categories").expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.categories?.map((category) => category.slug)).not.toContain(
      "inactive",
    );
  });
});
