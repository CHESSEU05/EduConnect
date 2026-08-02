import type { Request, Response } from "express";

import { instructorDashboardService } from "../services/instructor-dashboard.service.js";
import { AppError } from "../utils/app-error.js";

export const getInstructorDashboard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.authenticatedUser) {
    throw new AppError("Authentication is required", 401);
  }

  const dashboard = await instructorDashboardService.getDashboard(
    req.authenticatedUser.id,
  );

  res.status(200).json({
    success: true,
    message: "Instructor dashboard retrieved successfully",
    data: {
      dashboard,
    },
  });
};
