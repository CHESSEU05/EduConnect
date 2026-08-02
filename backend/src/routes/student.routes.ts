import { Router } from "express";

import {
  getMyEnrollmentDetails,
  listMyEnrollments,
} from "../controllers/enrollment.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { validateRequest } from "../middleware/validate-request.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  courseIdParamsSchema,
  studentEnrollmentQuerySchema,
} from "../validators/learning.validator.js";

const studentRouter = Router();

studentRouter.use(asyncHandler(authenticate), authorize("student"));
studentRouter.get(
  "/me/enrollments",
  validateRequest({ query: studentEnrollmentQuerySchema }),
  asyncHandler(listMyEnrollments),
);
studentRouter.get(
  "/me/enrollments/:courseId",
  validateRequest({ params: courseIdParamsSchema }),
  asyncHandler(getMyEnrollmentDetails),
);

export { studentRouter };
