import { Router } from "express";

import {
  getCategoryBySlug,
  listCategories,
} from "../controllers/category.controller.js";
import { validateRequest } from "../middleware/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import { categorySlugParamsSchema } from "../validators/category.validator.js";

const categoryRouter = Router();

categoryRouter.get("/", asyncHandler(listCategories));
categoryRouter.get(
  "/:slug",
  validateRequest({ params: categorySlugParamsSchema }),
  asyncHandler(getCategoryBySlug),
);

export { categoryRouter };
