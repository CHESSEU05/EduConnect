import type { Request, Response } from "express";

import { enrollmentService } from "../services/enrollment.service.js";
import { AppError } from "../utils/app-error.js";
import type {
  CourseIdParams,
  InstructorEnrollmentQuery,
  StudentEnrollmentQuery,
} from "../validators/learning.validator.js";

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.authenticatedUser) {
    throw new AppError("Authentication is required", 401);
  }

  return req.authenticatedUser.id;
};

export const enrollInCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  const enrollment = await enrollmentService.enrollStudent(
    getAuthenticatedUserId(req),
    params.courseId,
  );

  res.status(201).json({
    success: true,
    message: "Enrolment completed successfully",
    data: {
      enrollment,
    },
  });
};

export const listMyEnrollments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = req.query as unknown as StudentEnrollmentQuery;
  const data = await enrollmentService.listStudentEnrollments(
    getAuthenticatedUserId(req),
    query,
  );

  res.status(200).json({
    success: true,
    message: "Enrollments retrieved successfully",
    data,
  });
};

export const getMyEnrollmentDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  const enrollment = await enrollmentService.getStudentEnrollmentDetails(
    getAuthenticatedUserId(req),
    params.courseId,
  );

  res.status(200).json({
    success: true,
    message: "Enrollment retrieved successfully",
    data: {
      enrollment,
    },
  });
};

export const listInstructorCourseEnrollments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  const query = req.query as unknown as InstructorEnrollmentQuery;
  const data = await enrollmentService.listCourseEnrollmentsForInstructor(
    getAuthenticatedUserId(req),
    params.courseId,
    query,
  );

  res.status(200).json({
    success: true,
    message: "Course enrollments retrieved successfully",
    data,
  });
};
