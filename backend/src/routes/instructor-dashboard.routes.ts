import { Router } from "express";

import { getInstructorDashboard } from "../controllers/instructor-dashboard.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { asyncHandler } from "../utils/async-handler.js";

const instructorDashboardRouter = Router();

instructorDashboardRouter.use(asyncHandler(authenticate), authorize("instructor"));
instructorDashboardRouter.get(
  "/dashboard",
  asyncHandler(getInstructorDashboard),
);

export { instructorDashboardRouter };
