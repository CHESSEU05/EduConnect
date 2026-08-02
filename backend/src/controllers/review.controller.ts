import type { Request, Response } from "express";

import { reviewService } from "../services/review.service.js";
import { AppError } from "../utils/app-error.js";
import type { CourseIdParams } from "../validators/learning.validator.js";
import type {
  CreateReviewInput,
  ReviewListQuery,
  UpdateReviewInput,
} from "../validators/review.validator.js";

const getAuthenticatedUserId = (req: Request): string => {
  if (!req.authenticatedUser) {
    throw new AppError("Authentication is required", 401);
  }

  return req.authenticatedUser.id;
};

export const createReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  const body = req.body as CreateReviewInput;
  const review = await reviewService.createReview(
    getAuthenticatedUserId(req),
    params.courseId,
    body,
  );

  res.status(201).json({
    success: true,
    message: "Review created successfully",
    data: {
      review,
    },
  });
};

export const listPublicReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  const query = req.query as unknown as ReviewListQuery;
  const data = await reviewService.listPublicReviews(params.courseId, query);

  res.status(200).json({
    success: true,
    message: "Reviews retrieved successfully",
    data,
  });
};

export const updateMyReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  const body = req.body as UpdateReviewInput;
  const review = await reviewService.updateMyReview(
    getAuthenticatedUserId(req),
    params.courseId,
    body,
  );

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: {
      review,
    },
  });
};

export const deleteMyReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  await reviewService.deleteMyReview(getAuthenticatedUserId(req), params.courseId);

  res.status(204).send();
};

export const listInstructorCourseReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const params = req.params as CourseIdParams;
  const query = req.query as unknown as ReviewListQuery;
  const data = await reviewService.listCourseReviewsForInstructor(
    getAuthenticatedUserId(req),
    params.courseId,
    query,
  );

  res.status(200).json({
    success: true,
    message: "Course reviews retrieved successfully",
    data,
  });
};
