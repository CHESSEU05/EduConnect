import { Router } from "express";

import {
  archiveInstructorCourse,
  createInstructorCourse,
  deleteInstructorCourse,
  getInstructorCourse,
  listInstructorCourses,
  publishInstructorCourse,
  updateInstructorCourse,
} from "../controllers/course.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  courseIdParamsSchema,
  createCourseSchema,
  instructorCourseQuerySchema,
  updateCourseSchema,
} from "../validators/course.validator.js";

const instructorCourseRouter = Router();

instructorCourseRouter.use(asyncHandler(authenticate), authorize("instructor"));
instructorCourseRouter.get(
  "/",
  validateRequest({ query: instructorCourseQuerySchema }),
  asyncHandler(listInstructorCourses),
);
instructorCourseRouter.post(
  "/",
  validateRequest({ body: createCourseSchema }),
  asyncHandler(createInstructorCourse),
);
instructorCourseRouter.get(
  "/:courseId",
  validateRequest({ params: courseIdParamsSchema }),
  asyncHandler(getInstructorCourse),
);
instructorCourseRouter.patch(
  "/:courseId",
  validateRequest({ params: courseIdParamsSchema, body: updateCourseSchema }),
  asyncHandler(updateInstructorCourse),
);
instructorCourseRouter.patch(
  "/:courseId/publish",
  validateRequest({ params: courseIdParamsSchema }),
  asyncHandler(publishInstructorCourse),
);
instructorCourseRouter.patch(
  "/:courseId/archive",
  validateRequest({ params: courseIdParamsSchema }),
  asyncHandler(archiveInstructorCourse),
);
instructorCourseRouter.delete(
  "/:courseId",
  validateRequest({ params: courseIdParamsSchema }),
  asyncHandler(deleteInstructorCourse),
);

export { instructorCourseRouter };
