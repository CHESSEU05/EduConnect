import type { SortOrder } from "mongoose";

import { Review } from "../models/review.model.js";
import type { IReview, ReviewDocument } from "../types/review.js";
import { toObjectId } from "../utils/object-id.js";

export type CreateReviewInput = Omit<IReview, "createdAt" | "updatedAt">;

export type UpdateReviewInput = Partial<Pick<IReview, "comment" | "rating">>;

export type ReviewListFilters = {
  courseId: string;
  page: number;
  limit: number;
  sort: "newest" | "oldest" | "highest" | "lowest";
};

export type ReviewSummary = {
  reviewCount: number;
  averageRating: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

const studentPopulate = {
  path: "student",
  select: "firstName lastName username avatarUrl bio",
};

const coursePopulate = {
  path: "course",
  select: "title slug instructor",
};

const getReviewSort = (
  sort: ReviewListFilters["sort"],
): Record<string, SortOrder> => {
  const sortMap: Record<ReviewListFilters["sort"], Record<string, SortOrder>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { rating: -1 },
    lowest: { rating: 1 },
  };

  return sortMap[sort];
};

export class ReviewRepository {
  public async create(input: CreateReviewInput): Promise<ReviewDocument> {
    return Review.create(input);
  }

  public async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<ReviewDocument | null> {
    return Review.findOne({
      student: studentId,
      course: courseId,
    }).exec();
  }

  public async updateByStudentAndCourse(
    studentId: string,
    courseId: string,
    input: UpdateReviewInput,
  ): Promise<ReviewDocument | null> {
    return Review.findOneAndUpdate(
      {
        student: studentId,
        course: courseId,
      },
      input,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate(studentPopulate)
      .exec();
  }

  public async deleteByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<ReviewDocument | null> {
    return Review.findOneAndDelete({
      student: studentId,
      course: courseId,
    }).exec();
  }

  public async findByCourse(
    filters: ReviewListFilters,
  ): Promise<ReviewDocument[]> {
    return Review.find({ course: filters.courseId })
      .populate(studentPopulate)
      .sort(getReviewSort(filters.sort))
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .exec();
  }

  public async countByCourse(courseId: string): Promise<number> {
    return Review.countDocuments({ course: courseId }).exec();
  }

  public async calculateSummary(courseId: string): Promise<ReviewSummary> {
    const reviews = await Review.find({ course: courseId }).select("rating").exec();
    const distribution: ReviewSummary["distribution"] = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const review of reviews) {
      const rating = review.rating as 1 | 2 | 3 | 4 | 5;
      distribution[rating] += 1;
    }

    const reviewCount = reviews.length;
    const averageRating =
      reviewCount === 0
        ? 0
        : Math.round(
            (reviews.reduce((total, review) => total + review.rating, 0) /
              reviewCount) *
              10,
          ) / 10;

    return {
      reviewCount,
      averageRating,
      distribution,
    };
  }

  public async countByCourseIds(courseIds: string[]): Promise<Map<string, number>> {
    const results = await Review.aggregate<{
      _id: string;
      total: number;
    }>([
      {
        $match: {
          course: {
            $in: courseIds.map((courseId) => toObjectId(courseId)),
          },
        },
      },
      {
        $group: {
          _id: "$course",
          total: {
            $sum: 1,
          },
        },
      },
    ]);

    return new Map(results.map((result) => [String(result._id), result.total]));
  }

  public async findRecentByCourseIds(
    courseIds: string[],
    limit: number,
  ): Promise<ReviewDocument[]> {
    return Review.find({
      course: {
        $in: courseIds.map((courseId) => toObjectId(courseId)),
      },
    })
      .populate(studentPopulate)
      .populate(coursePopulate)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}

export const reviewRepository = new ReviewRepository();
