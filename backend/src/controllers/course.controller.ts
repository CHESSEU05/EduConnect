import type { Request, Response } from "express";

import { courseService } from "../services/course.service.js";
import { AppError } from "../utils/app-error.js";
import type {
  CourseIdParams,
  CourseSlugParams,
  CreateCourseInput,
  InstructorCourseQuery,
  PublicCourseQuery,
  UpdateCourseInput,
} from "../validators/course.validator.js";

const getAuthenticatedInstructorId = (req: Request): string => {
  if (!req.authenticatedUser) {
    throw new AppError("Authentication is required", 401);
  }

  return req.authenticatedUser.id;
};

export const createInstructorCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const body = req.body as CreateCourseInput;
  const course = await courseService.createInstructorCourse(
    getAuthenticatedInstructorId(req),
    body,
  );

  res.status(201).json({
    success: true,
    message: "Course created successfully",
    data: {
      course,
    },
  });
};

export const listInstructorCourses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = req.query as unknown as InstructorCourseQuery;
  const data = await courseService.listInstructorCourses(
    getAuthenticatedInstructorId(req),
    query,
  );

  res.status(200).json({
    success: true,
    message: "Instructor courses retrieved successfully",
    data,
  });
};

export const getInstructorCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  const course = await courseService.getInstructorCourse(
    getAuthenticatedInstructorId(req),
    params.courseId,
  );

  res.status(200).json({
    success: true,
    message: "Instructor course retrieved successfully",
    data: {
      course,
    },
  });
};

export const updateInstructorCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  const body = req.body as UpdateCourseInput;
  const course = await courseService.updateInstructorCourse(
    getAuthenticatedInstructorId(req),
    params.courseId,
    body,
  );

  res.status(200).json({
    success: true,
    message: "Course updated successfully",
    data: {
      course,
    },
  });
};

export const publishInstructorCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  const course = await courseService.publishInstructorCourse(
    getAuthenticatedInstructorId(req),
    params.courseId,
  );

  res.status(200).json({
    success: true,
    message: "Course published successfully",
    data: {
      course,
    },
  });
};

export const archiveInstructorCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  const course = await courseService.archiveInstructorCourse(
    getAuthenticatedInstructorId(req),
    params.courseId,
  );

  res.status(200).json({
    success: true,
    message: "Course archived successfully",
    data: {
      course,
    },
  });
};

export const deleteInstructorCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  await courseService.deleteInstructorCourse(
    getAuthenticatedInstructorId(req),
    params.courseId,
  );

  res.status(204).send();
};

export const listPublicCourses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const query = req.query as unknown as PublicCourseQuery;
  const data = await courseService.listPublicCourses(query);

  res.status(200).json({
    success: true,
    message: "Courses retrieved successfully",
    data,
  });
};

export const getPublicCourseDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseSlugParams;
  const course = await courseService.getPublicCourseDetails(params.slug);

  res.status(200).json({
    success: true,
    message: "Course retrieved successfully",
    data: {
      course,
    },
  });
};
