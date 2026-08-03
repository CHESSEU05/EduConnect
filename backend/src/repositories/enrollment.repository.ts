import type { SortOrder } from "mongoose";

import { Enrollment } from "../models/enrollment.model.js";
import type {
  EnrollmentDocument,
  EnrollmentStatus,
  IEnrollment,
} from "../types/enrollment.js";
import { toObjectId } from "../utils/object-id.js";

export type CreateEnrollmentInput = Omit<
  IEnrollment,
  "createdAt" | "enrolledAt" | "updatedAt"
> &
  Partial<Pick<IEnrollment, "enrolledAt">>;

export type StudentEnrollmentFilters = {
  studentId: string;
  page: number;
  limit: number;
  status?: EnrollmentStatus;
  search?: string;
  courseIds?: string[];
  sort: "newest" | "oldest" | "recently-accessed" | "progress";
};

export type CourseEnrollmentFilters = {
  courseId: string;
  page: number;
  limit: number;
  status?: EnrollmentStatus;
  search?: string;
  sort: "newest" | "oldest" | "progress";
};

const coursePopulate = {
  path: "course",
  populate: [
    {
      path: "category",
      select: "name slug description icon",
    },
    {
      path: "instructor",
      select: "firstName lastName username avatarUrl bio",
    },
  ],
};

const studentPopulate = {
  path: "student",
  select: "firstName lastName username avatarUrl bio",
};

const studentEnrollmentSort = (
  sort: StudentEnrollmentFilters["sort"],
): Record<string, SortOrder> => {
  const sortMap: Record<StudentEnrollmentFilters["sort"], Record<string, SortOrder>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "recently-accessed": { lastAccessedAt: -1 },
    progress: { progressPercentage: -1 },
  };

  return sortMap[sort];
};

const courseEnrollmentSort = (
  sort: CourseEnrollmentFilters["sort"],
): Record<string, SortOrder> => {
  const sortMap: Record<CourseEnrollmentFilters["sort"], Record<string, SortOrder>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    progress: { progressPercentage: -1 },
  };

  return sortMap[sort];
};

export class EnrollmentRepository {
  public async create(
    input: CreateEnrollmentInput,
  ): Promise<EnrollmentDocument> {
    return Enrollment.create(input);
  }

  public async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<EnrollmentDocument | null> {
    return Enrollment.findOne({
      student: studentId,
      course: courseId,
    }).exec();
  }

  public async findByStudentAndCourseWithCourse(
    studentId: string,
    courseId: string,
  ): Promise<EnrollmentDocument | null> {
    return Enrollment.findOne({
      student: studentId,
      course: courseId,
    })
      .populate(coursePopulate)
      .exec();
  }

  public async findStudentEnrollments(
    filters: StudentEnrollmentFilters,
  ): Promise<EnrollmentDocument[]> {
    const query = this.buildEnrollmentQuery({
      student: filters.studentId,
      ...(filters.status !== undefined ? { status: filters.status } : {}),
      ...(filters.search !== undefined ? { search: filters.search } : {}),
    });

    return Enrollment.find(query)
      .populate(coursePopulate)
      .sort(studentEnrollmentSort(filters.sort))
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .exec();
  }

  public async countStudentEnrollments(
    filters: Omit<StudentEnrollmentFilters, "limit" | "page" | "sort">,
  ): Promise<number> {
    return Enrollment.countDocuments(
      this.buildEnrollmentQuery({
        student: filters.studentId,
        ...(filters.status !== undefined ? { status: filters.status } : {}),
        ...(filters.search !== undefined ? { search: filters.search } : {}),
      }),
    ).exec();
  }

  public async findCourseEnrollments(
    filters: CourseEnrollmentFilters,
  ): Promise<EnrollmentDocument[]> {
    const query = this.buildEnrollmentQuery({
      course: filters.courseId,
      ...(filters.status !== undefined ? { status: filters.status } : {}),
      ...(filters.search !== undefined ? { search: filters.search } : {}),
    });

    return Enrollment.find(query)
      .populate(studentPopulate)
      .sort(courseEnrollmentSort(filters.sort))
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .exec();
  }

  public async countCourseEnrollments(
    filters: Omit<CourseEnrollmentFilters, "limit" | "page" | "sort">,
  ): Promise<number> {
    return Enrollment.countDocuments(
      this.buildEnrollmentQuery({
        course: filters.courseId,
        ...(filters.status !== undefined ? { status: filters.status } : {}),
        ...(filters.search !== undefined ? { search: filters.search } : {}),
      }),
    ).exec();
  }

  public async updateLastAccessed(
    enrollmentId: string,
  ): Promise<EnrollmentDocument | null> {
    return Enrollment.findByIdAndUpdate(
      enrollmentId,
      {
        $set: {
          lastAccessedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate(coursePopulate)
      .exec();
  }

  public async updateProgress(
    enrollmentId: string,
    progressPercentage: number,
  ): Promise<EnrollmentDocument | null> {
    const isCompleted = progressPercentage >= 100;

    return Enrollment.findByIdAndUpdate(
      enrollmentId,
      {
        $set: {
          progressPercentage,
          status: isCompleted ? "completed" : "active",
          lastAccessedAt: new Date(),
          completedAt: isCompleted ? new Date() : null,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate(coursePopulate)
      .exec();
  }

  public async countByCourseIds(courseIds: string[]): Promise<Map<string, number>> {
    const results = await Enrollment.aggregate<{
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
  ): Promise<EnrollmentDocument[]> {
    return Enrollment.find({
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

  private buildEnrollmentQuery(input: {
    student?: string;
    course?: string;
    courseIds?: string[];
    status?: EnrollmentStatus;
    search?: string;
  }): Record<string, unknown> {
    const query: Record<string, unknown> = {};

    if (input.student) {
      query.student = input.student;
    }

    if (input.course) {
      query.course = input.course;
    }

    if (input.courseIds && input.courseIds.length > 0) {
      query.course = {
        $in: input.courseIds.map((courseId) => toObjectId(courseId)),
      };
    }

    if (input.status) {
      query.status = input.status;
    }

    return query;
  }
}

export const enrollmentRepository = new EnrollmentRepository();
