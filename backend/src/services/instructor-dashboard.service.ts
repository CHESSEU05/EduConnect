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
} from "../repositories/review.repository.js";
import type { CourseDocument } from "../types/course.js";
import { toSafeUserProfile } from "../utils/safe-response.js";

export class InstructorDashboardService {
  public constructor(
    private readonly courses: CourseRepository = courseRepository,
    private readonly enrollments: EnrollmentRepository = enrollmentRepository,
    private readonly reviews: ReviewRepository = reviewRepository,
  ) {}

  public async getDashboard(instructorId: string) {
    const courses = await this.courses.findByInstructor(instructorId);
    const courseIds = courses.map((course) => course._id.toString());
    const [recentEnrollments, recentReviews] = await Promise.all([
      this.enrollments.findRecentByCourseIds(courseIds, 5),
      this.reviews.findRecentByCourseIds(courseIds, 5),
    ]);
    const totalReviews = courses.reduce(
      (total, course) => total + course.reviewCount,
      0,
    );
    const weightedRatingTotal = courses.reduce(
      (total, course) => total + course.averageRating * course.reviewCount,
      0,
    );

    return {
      totalCourses: courses.length,
      draftCourses: courses.filter((course) => course.status === "draft").length,
      publishedCourses: courses.filter((course) => course.status === "published")
        .length,
      archivedCourses: courses.filter((course) => course.status === "archived")
        .length,
      totalEnrollments: courses.reduce(
        (total, course) => total + course.enrollmentCount,
        0,
      ),
      totalReviews,
      averageRating:
        totalReviews === 0
          ? 0
          : Math.round((weightedRatingTotal / totalReviews) * 10) / 10,
      recentEnrollments: recentEnrollments.map((enrollment) => ({
        id: enrollment._id.toString(),
        student: toSafeUserProfile(enrollment.student),
        courseId: String(enrollment.course),
        enrolledAt: enrollment.enrolledAt.toISOString(),
      })),
      recentReviews: recentReviews.map((review) => ({
        id: review._id.toString(),
        rating: review.rating,
        comment: review.comment,
        student: toSafeUserProfile(review.student),
        courseId: String(review.course),
        createdAt: review.createdAt.toISOString(),
      })),
      topCourses: this.getTopCourses(courses),
    };
  }

  private getTopCourses(courses: CourseDocument[]) {
    return [...courses]
      .sort((left, right) => {
        if (right.enrollmentCount !== left.enrollmentCount) {
          return right.enrollmentCount - left.enrollmentCount;
        }

        if (right.averageRating !== left.averageRating) {
          return right.averageRating - left.averageRating;
        }

        return right.reviewCount - left.reviewCount;
      })
      .slice(0, 5)
      .map((course) => ({
        id: course._id.toString(),
        title: course.title,
        slug: course.slug,
        status: course.status,
        enrollmentCount: course.enrollmentCount,
        averageRating: course.averageRating,
        reviewCount: course.reviewCount,
      }));
  }
}

export const instructorDashboardService = new InstructorDashboardService();
