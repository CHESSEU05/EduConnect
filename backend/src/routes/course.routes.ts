import { Router } from "express";

import {
  getPublicCourseDetails,
  listPublicCourses,
} from "../controllers/course.controller.js";
import { validateRequest } from "../middleware/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  courseSlugParamsSchema,
  publicCourseQuerySchema,
} from "../validators/course.validator.js";

const courseRouter = Router();

courseRouter.get(
  "/",
  validateRequest({ query: publicCourseQuerySchema }),
  asyncHandler(listPublicCourses),
);
courseRouter.get(
  "/:slug",
  validateRequest({ params: courseSlugParamsSchema }),
  asyncHandler(getPublicCourseDetails),
);

export { courseRouter };
