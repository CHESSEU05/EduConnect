import { Category } from "../models/category.model.js";
import type { CategoryDocument, ICategory } from "../types/category.js";

export type UpsertCategoryInput = Pick<
  ICategory,
  "displayOrder" | "isActive" | "name" | "slug"
> &
  Partial<Pick<ICategory, "description" | "icon">>;

export class CategoryRepository {
  public async findActive(): Promise<CategoryDocument[]> {
    return Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }).exec();
  }

  public async findActiveBySlug(slug: string): Promise<CategoryDocument | null> {
    return Category.findOne({
      slug: slug.toLowerCase().trim(),
      isActive: true,
    }).exec();
  }

  public async findById(categoryId: string): Promise<CategoryDocument | null> {
    return Category.findById(categoryId).exec();
  }

  public async findActiveById(
    categoryId: string,
  ): Promise<CategoryDocument | null> {
    return Category.findOne({
      _id: categoryId,
      isActive: true,
    }).exec();
  }

  public async upsertBySlug(input: UpsertCategoryInput): Promise<{
    category: CategoryDocument;
    created: boolean;
  }> {
    const existingCategory = await Category.findOne({ slug: input.slug }).exec();

    if (existingCategory) {
      existingCategory.set(input);

      return {
        category: await existingCategory.save(),
        created: false,
      };
    }

    return {
      category: await Category.create(input),
      created: true,
    };
  }
}

export const categoryRepository = new CategoryRepository();
