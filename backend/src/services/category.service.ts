import type { CategoryDocument } from "../types/category.js";
import {
  categoryRepository,
  type CategoryRepository,
  type UpsertCategoryInput,
} from "../repositories/category.repository.js";
import { AppError } from "../utils/app-error.js";
import { createSlug } from "../utils/slug.js";

export type CategoryResponse = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
};

export type CategorySeedResult = {
  created: number;
  updated: number;
};

export const defaultCategories: UpsertCategoryInput[] = [
  "Programming",
  "Data Science & Artificial Intelligence",
  "Design",
  "Business & Entrepreneurship",
  "Marketing",
  "Engineering",
  "Academic Support",
  "Languages",
  "Personal Development",
].map((name, index) => ({
  name,
  slug: createSlug(name),
  description: null,
  icon: null,
  isActive: true,
  displayOrder: index,
}));

export class CategoryService {
  public constructor(
    private readonly categories: CategoryRepository = categoryRepository,
  ) {}

  public async listActiveCategories(): Promise<CategoryResponse[]> {
    const categories = await this.categories.findActive();

    return categories.map((category) => this.toCategoryResponse(category));
  }

  public async getActiveCategoryBySlug(
    slug: string,
  ): Promise<CategoryResponse> {
    const category = await this.categories.findActiveBySlug(slug);

    if (!category) {
      throw new AppError("Category not found.", 404);
    }

    return this.toCategoryResponse(category);
  }

  public async seedDefaultCategories(): Promise<CategorySeedResult> {
    let created = 0;
    let updated = 0;

    for (const category of defaultCategories) {
      const result = await this.categories.upsertBySlug(category);

      if (result.created) {
        created += 1;
      } else {
        updated += 1;
      }
    }

    return {
      created,
      updated,
    };
  }

  private toCategoryResponse(category: CategoryDocument): CategoryResponse {
    return {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      icon: category.icon ?? null,
      displayOrder: category.displayOrder,
    };
  }
}

export const categoryService = new CategoryService();
