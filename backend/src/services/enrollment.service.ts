import {
  courseRepository,
  type CourseRepository,
} from "../repositories/course.repository.js";
import {
  enrollmentRepository,
  type EnrollmentRepository,
} from "../repositories/enrollment.repository.js";
import type { CourseDocument } from "../types/course.js";
import type { EnrollmentDocument } from "../types/enrollment.js";
import { AppError } from "../utils/app-error.js";
import { getDuplicateKeyField, isDuplicateKeyError } from "../utils/mongo-errors.js";
import { isValidObjectId, toObjectId } from "../utils/object-id.js";
import {
  getId,
  isRecord,
  toLearningModule,
  toSafeCategory,
  toSafeUserProfile,
} from "../utils/safe-response.js";
import type {
  InstructorEnrollmentQuery,
  StudentEnrollmentQuery,
} from "../validators/learning.validator.js";

type PaginationResponse = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type EnrollmentResponse = {
  id: string;
  status: string;
  progressPercentage: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
  course: unknown;
};

export class EnrollmentService {
  public constructor(
    private readonly enrollments: EnrollmentRepository = enrollmentRepository,
    private readonly courses: CourseRepository = courseRepository,
  ) {}

  public async enrollStudent(
    studentId: string,
    courseId: string,
  ): Promise<EnrollmentResponse> {
    this.assertCourseId(courseId);
    const course = await this.courses.findById(courseId);

    if (!course) {
      throw new AppError("Course not found.", 404);
    }

    if (course.status !== "published") {
      throw new AppError("Only published courses can be enrolled in.", 400);
    }

    const existingEnrollment = await this.enrollments.findByStudentAndCourse(
      studentId,
      courseId,
    );

    if (existingEnrollment) {
      throw new AppError("You are already enrolled in this course", 409);
    }

    try {
      const enrollment = await this.enrollments.create({
        student: toObjectId(studentId),
        course: toObjectId(courseId),
        status: "active",
        progressPercentage: 0,
        lastAccessedAt: null,
        completedAt: null,
      });

      const updatedCourse =
        (await this.courses.incrementEnrollmentCount(courseId)) ?? course;

      return this.toEnrollmentResponse(enrollment, updatedCourse);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const field = getDuplicateKeyField(error);

        if (!field || field === "student" || field === "course") {
          throw new AppError("You are already enrolled in this course", 409);
        }
      }

      throw error;
    }
  }

  public async listStudentEnrollments(
    studentId: string,
    query: StudentEnrollmentQuery,
  ) {
    const courseIds = query.search
      ? await this.courses.findIdsByTitleSearch(query.search)
      : undefined;

    if (query.search && courseIds && courseIds.length === 0) {
      return {
        enrollments: [],
        pagination: this.toPagination(query.page, query.limit, 0),
      };
    }

    const filters = {
      studentId,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(courseIds !== undefined ? { courseIds } : {}),
    };
    const countFilters = {
      studentId,
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(courseIds !== undefined ? { courseIds } : {}),
    };
    const [enrollments, totalItems] = await Promise.all([
      this.enrollments.findStudentEnrollments(filters),
      this.enrollments.countStudentEnrollments(countFilters),
    ]);

    return {
      enrollments: enrollments.map((enrollment) =>
        this.toEnrollmentResponse(enrollment, this.getPopulatedCourse(enrollment), {
          includeModules: false,
        }),
      ),
      pagination: this.toPagination(query.page, query.limit, totalItems),
    };
  }

  public async getStudentEnrollmentDetails(
    studentId: string,
    courseId: string,
  ): Promise<EnrollmentResponse> {
    this.assertCourseId(courseId);

    const enrollment =
      await this.enrollments.findByStudentAndCourseWithCourse(studentId, courseId);

    if (!enrollment) {
      throw new AppError("Enrollment not found.", 404);
    }

    const updatedEnrollment =
      (await this.enrollments.updateLastAccessed(enrollment._id.toString())) ??
      enrollment;

    return this.toEnrollmentResponse(
      updatedEnrollment,
      this.getPopulatedCourse(updatedEnrollment),
      {
        includeModules: true,
      },
    );
  }

  public async listCourseEnrollmentsForInstructor(
    instructorId: string,
    courseId: string,
    query: InstructorEnrollmentQuery,
  ) {
    const course = await this.getOwnedCourse(instructorId, courseId);
    const filters = {
      courseId: course._id.toString(),
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.search !== undefined ? { search: query.search } : {}),
    };
    const countFilters = {
      courseId: course._id.toString(),
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.search !== undefined ? { search: query.search } : {}),
    };
    const [enrollments, totalItems] = await Promise.all([
      this.enrollments.findCourseEnrollments(filters),
      this.enrollments.countCourseEnrollments(countFilters),
    ]);

    return {
      enrollments: enrollments.map((enrollment) => ({
        id: enrollment._id.toString(),
        status: enrollment.status,
        progressPercentage: enrollment.progressPercentage,
        lastAccessedAt: enrollment.lastAccessedAt?.toISOString() ?? null,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        student: toSafeUserProfile(enrollment.student),
      })),
      pagination: this.toPagination(query.page, query.limit, totalItems),
    };
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

  private assertCourseId(courseId: string): void {
    if (!isValidObjectId(courseId)) {
      throw new AppError("Course id is invalid.", 400);
    }
  }

  private getPopulatedCourse(enrollment: EnrollmentDocument): CourseDocument {
    return enrollment.course as unknown as CourseDocument;
  }

  private toEnrollmentResponse(
    enrollment: EnrollmentDocument,
    course: CourseDocument,
    options: { includeModules?: boolean } = {},
  ): EnrollmentResponse {
    return {
      id: enrollment._id.toString(),
      status: enrollment.status,
      progressPercentage: enrollment.progressPercentage,
      lastAccessedAt: enrollment.lastAccessedAt?.toISOString() ?? null,
      completedAt: enrollment.completedAt?.toISOString() ?? null,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      createdAt: enrollment.createdAt.toISOString(),
      updatedAt: enrollment.updatedAt.toISOString(),
      course: this.toCourseSummary(course, options.includeModules === true),
    };
  }

  private toCourseSummary(course: CourseDocument, includeModules: boolean) {
    const base = {
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      description: includeModules ? course.description : undefined,
      category: toSafeCategory(course.category),
      instructor: toSafeUserProfile(course.instructor),
      level: course.level,
      language: course.language,
      thumbnailUrl: course.thumbnailUrl ?? null,
      isFree: course.isFree,
      price: course.price,
      currency: course.currency,
      averageRating: course.averageRating,
      reviewCount: course.reviewCount,
      enrollmentCount: course.enrollmentCount,
      moduleCount: course.modules.length,
    };

    if (!includeModules) {
      return base;
    }

    return {
      ...base,
      modules: course.modules
        .map((module) => toLearningModule(module))
        .sort((left, right) => left.order - right.order),
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

export const enrollmentService = new EnrollmentService();
