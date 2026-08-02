import {
  courseRepository,
  type CourseRepository,
} from "../repositories/course.repository.js";
import {
  enrollmentRepository,
  type EnrollmentRepository,
} from "../repositories/enrollment.repository.js";
import {
  reviewRepository,
  type ReviewRepository,
  type ReviewSummary,
} from "../repositories/review.repository.js";
import type { CourseDocument } from "../types/course.js";
import type { ReviewDocument } from "../types/review.js";
import { AppError } from "../utils/app-error.js";
import { getDuplicateKeyField, isDuplicateKeyError } from "../utils/mongo-errors.js";
import { isValidObjectId, toObjectId } from "../utils/object-id.js";
import { toSafeUserProfile } from "../utils/safe-response.js";
import type {
  CreateReviewInput,
  ReviewListQuery,
  UpdateReviewInput,
} from "../validators/review.validator.js";

type PaginationResponse = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type ReviewResponse = {
  id: string;
  rating: number;
  comment: string;
  student: unknown;
  createdAt: string;
  updatedAt: string;
};

export class ReviewService {
  public constructor(
    private readonly reviews: ReviewRepository = reviewRepository,
    private readonly enrollments: EnrollmentRepository = enrollmentRepository,
    private readonly courses: CourseRepository = courseRepository,
  ) {}

  public async createReview(
    studentId: string,
    courseId: string,
    input: CreateReviewInput,
  ): Promise<ReviewResponse> {
    const course = await this.getPublishedCourse(courseId);
    await this.assertStudentIsEnrolled(studentId, course._id.toString());

    const existingReview = await this.reviews.findByStudentAndCourse(
      studentId,
      courseId,
    );

    if (existingReview) {
      throw new AppError("You have already reviewed this course.", 409);
    }

    try {
      const review = await this.reviews.create({
        student: toObjectId(studentId),
        course: toObjectId(courseId),
        rating: input.rating,
        comment: input.comment,
      });

      await this.refreshCourseReviewStats(courseId);

      return this.toReviewResponse(review);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const field = getDuplicateKeyField(error);

        if (!field || field === "student" || field === "course") {
          throw new AppError("You have already reviewed this course.", 409);
        }
      }

      throw error;
    }
  }

  public async listPublicReviews(courseId: string, query: ReviewListQuery) {
    await this.getPublishedCourse(courseId);
    const [reviews, totalItems, summary] = await Promise.all([
      this.reviews.findByCourse({
        courseId,
        page: query.page,
        limit: query.limit,
        sort: query.sort,
      }),
      this.reviews.countByCourse(courseId),
      this.reviews.calculateSummary(courseId),
    ]);

    return {
      reviews: reviews.map((review) => this.toReviewResponse(review)),
      summary,
      pagination: this.toPagination(query.page, query.limit, totalItems),
    };
  }

  public async updateMyReview(
    studentId: string,
    courseId: string,
    input: UpdateReviewInput,
  ): Promise<ReviewResponse> {
    await this.getPublishedCourse(courseId);
    const updateInput = {
      ...(input.comment !== undefined ? { comment: input.comment } : {}),
      ...(input.rating !== undefined ? { rating: input.rating } : {}),
    };
    const review = await this.reviews.updateByStudentAndCourse(
      studentId,
      courseId,
      updateInput,
    );

    if (!review) {
      throw new AppError("Review not found.", 404);
    }

    await this.refreshCourseReviewStats(courseId);

    return this.toReviewResponse(review);
  }

  public async deleteMyReview(
    studentId: string,
    courseId: string,
  ): Promise<void> {
    await this.getPublishedCourse(courseId);
    const review = await this.reviews.deleteByStudentAndCourse(studentId, courseId);

    if (!review) {
      throw new AppError("Review not found.", 404);
    }

    await this.refreshCourseReviewStats(courseId);
  }

  public async listCourseReviewsForInstructor(
    instructorId: string,
    courseId: string,
    query: ReviewListQuery,
  ) {
    const course = await this.getOwnedCourse(instructorId, courseId);
    const [reviews, totalItems, summary] = await Promise.all([
      this.reviews.findByCourse({
        courseId: course._id.toString(),
        page: query.page,
        limit: query.limit,
        sort: query.sort,
      }),
      this.reviews.countByCourse(course._id.toString()),
      this.reviews.calculateSummary(course._id.toString()),
    ]);

    return {
      reviews: reviews.map((review) => this.toReviewResponse(review)),
      summary,
      pagination: this.toPagination(query.page, query.limit, totalItems),
    };
  }

  public async refreshCourseReviewStats(courseId: string): Promise<ReviewSummary> {
    const summary = await this.reviews.calculateSummary(courseId);
    await this.courses.updateReviewStats(courseId, {
      averageRating: summary.averageRating,
      reviewCount: summary.reviewCount,
    });

    return summary;
  }

  private async getPublishedCourse(courseId: string): Promise<CourseDocument> {
    this.assertCourseId(courseId);
    const course = await this.courses.findPublishedById(courseId);

    if (!course) {
      throw new AppError("Course not found.", 404);
    }

    return course;
  }

  private async getOwnedCourse(
    instructorId: string,
    courseId: string,
  ): Promise<CourseDocument> {
    this.assertCourseId(courseId);
    const course = await this.courses.findByIdForInstructor(courseId, instructorId);

    if (!course) {
      throw new AppError("Course not found.", 404);
    }

    return course;
  }

  private async assertStudentIsEnrolled(
    studentId: string,
    courseId: string,
  ): Promise<void> {
    const enrollment = await this.enrollments.findByStudentAndCourse(
      studentId,
      courseId,
    );

    if (!enrollment || enrollment.status === "cancelled") {
      throw new AppError("You must be enrolled in this course to review it.", 403);
    }
  }

  private assertCourseId(courseId: string): void {
    if (!isValidObjectId(courseId)) {
      throw new AppError("Course id is invalid.", 400);
    }
  }

  private toReviewResponse(review: ReviewDocument): ReviewResponse {
    return {
      id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      student: toSafeUserProfile(review.student),
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }

  private toPagination(
    page: number,
    limit: number,
    totalItems: number,
  ): PaginationResponse {
    const totalPages = Math.ceil(totalItems / limit);

    return {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }
}

export const reviewService = new ReviewService();
