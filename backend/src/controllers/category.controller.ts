import type { Request, Response } from "express";

import { categoryService } from "../services/category.service.js";
import type { CategorySlugParams } from "../validators/category.validator.js";

export const listCategories = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const categories = await categoryService.listActiveCategories();

  res.status(200).json({
    success: true,
    message: "Categories retrieved successfully",
    data: {
      categories,
    },
  });
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CategorySlugParams;
  const category = await categoryService.getActiveCategoryBySlug(params.slug);

  res.status(200).json({
    success: true,
    message: "Category retrieved successfully",
    data: {
      category,
    },
  });
};
