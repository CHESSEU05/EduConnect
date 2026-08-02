import { Router } from "express";

import {
  getPublicCourseDetails,
  listPublicCourses,
} from "../controllers/course.controller.js";
import { enrollInCourse } from "../controllers/enrollment.controller.js";
import {
  createReview,
  deleteMyReview,
  listPublicReviews,
  updateMyReview,
} from "../controllers/review.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  publicCourseQuerySchema,
  courseSlugParamsSchema,
} from "../validators/course.validator.js";
import { courseIdParamsSchema } from "../validators/learning.validator.js";
import {
  createReviewSchema,
  reviewListQuerySchema,
  updateReviewSchema,
} from "../validators/review.validator.js";

const courseRouter = Router();

courseRouter.get(
  "/",
  validateRequest({ query: publicCourseQuerySchema }),
  asyncHandler(listPublicCourses),
);
courseRouter.post(
  "/:courseId/enroll",
  asyncHandler(authenticate),
  authorize("student"),
  validateRequest({ params: courseIdParamsSchema }),
  asyncHandler(enrollInCourse),
);
courseRouter.post(
  "/:courseId/reviews",
  asyncHandler(authenticate),
  authorize("student"),
  validateRequest({ params: courseIdParamsSchema, body: createReviewSchema }),
  asyncHandler(createReview),
);
courseRouter.patch(
  "/:courseId/reviews/me",
  asyncHandler(authenticate),
  authorize("student"),
  validateRequest({ params: courseIdParamsSchema, body: updateReviewSchema }),
  asyncHandler(updateMyReview),
);
courseRouter.delete(
  "/:courseId/reviews/me",
  asyncHandler(authenticate),
  authorize("student"),
  validateRequest({ params: courseIdParamsSchema }),
  asyncHandler(deleteMyReview),
);
courseRouter.get(
  "/:courseId/reviews",
  validateRequest({ params: courseIdParamsSchema, query: reviewListQuerySchema }),
  asyncHandler(listPublicReviews),
);
courseRouter.get(
  "/:slug",
  validateRequest({ params: courseSlugParamsSchema }),
  asyncHandler(getPublicCourseDetails),
);

export { courseRouter };
