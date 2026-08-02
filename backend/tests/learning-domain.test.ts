import type { Express } from "express";
import request from "supertest";
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";

import type { CourseDocument, ICourse } from "../src/types/course.js";
import type { EnrollmentDocument, IEnrollment } from "../src/types/enrollment.js";
import type { IReview, ReviewDocument } from "../src/types/review.js";
import type { IUser, UserDocument } from "../src/types/user.js";

const userRepositoryMock = vi.hoisted(() => ({
  create: vi.fn(),
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByEmailOrUsernameWithPasswordHash: vi.fn(),
  findByIdWithPasswordHash: vi.fn(),
  findByUsername: vi.fn(),
  exists: vi.fn(),
  update: vi.fn(),
  updateProfile: vi.fn(),
  updatePasswordHash: vi.fn(),
  delete: vi.fn(),
  updateLastLogin: vi.fn(),
}));

const courseRepositoryMock = vi.hoisted(() => ({
  create: vi.fn(),
  existsBySlug: vi.fn(),
  existsBySlugExcludingCourse: vi.fn(),
  findInstructorCourses: vi.fn(),
  countInstructorCourses: vi.fn(),
  findByIdForInstructor: vi.fn(),
  updateByIdForInstructor: vi.fn(),
  publishByIdForInstructor: vi.fn(),
  archiveByIdForInstructor: vi.fn(),
  deleteByIdForInstructor: vi.fn(),
  findPublicCourses: vi.fn(),
  countPublicCourses: vi.fn(),
  findPublishedBySlug: vi.fn(),
  findById: vi.fn(),
  findPublishedById: vi.fn(),
  incrementEnrollmentCount: vi.fn(),
  updateReviewStats: vi.fn(),
  findByInstructor: vi.fn(),
}));

const enrollmentRepositoryMock = vi.hoisted(() => ({
  create: vi.fn(),
  findByStudentAndCourse: vi.fn(),
  findByStudentAndCourseWithCourse: vi.fn(),
  findStudentEnrollments: vi.fn(),
  countStudentEnrollments: vi.fn(),
  findCourseEnrollments: vi.fn(),
  countCourseEnrollments: vi.fn(),
  updateLastAccessed: vi.fn(),
  countByCourseIds: vi.fn(),
  findRecentByCourseIds: vi.fn(),
}));

const reviewRepositoryMock = vi.hoisted(() => ({
  create: vi.fn(),
  findByStudentAndCourse: vi.fn(),
  updateByStudentAndCourse: vi.fn(),
  deleteByStudentAndCourse: vi.fn(),
  findByCourse: vi.fn(),
  countByCourse: vi.fn(),
  calculateSummary: vi.fn(),
  countByCourseIds: vi.fn(),
  findRecentByCourseIds: vi.fn(),
}));

vi.mock("../src/repositories/user.repository.js", () => ({
  userRepository: userRepositoryMock,
  UserRepository: class UserRepository {},
}));

vi.mock("../src/repositories/course.repository.js", () => ({
  courseRepository: courseRepositoryMock,
  CourseRepository: class CourseRepository {},
}));

vi.mock("../src/repositories/enrollment.repository.js", () => ({
  enrollmentRepository: enrollmentRepositoryMock,
  EnrollmentRepository: class EnrollmentRepository {},
}));

vi.mock("../src/repositories/review.repository.js", () => ({
  reviewRepository: reviewRepositoryMock,
  ReviewRepository: class ReviewRepository {},
}));

type RepositoryMock<T extends Record<string, unknown>> = {
  [Key in keyof T]: Mock;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: {
    enrollment?: {
      id: string;
      course: {
        modules?: Array<{
          textContent?: string | null;
          resourceUrl?: string | null;
        }>;
      };
    };
    enrollments?: Array<{
      course: {
        modules?: unknown[];
      };
      student?: {
        email?: string;
        passwordHash?: string;
      };
    }>;
    review?: {
      rating: number;
      student: {
        email?: string;
        passwordHash?: string;
      };
    };
    reviews?: Array<{
      student: {
        email?: string;
        passwordHash?: string;
      };
    }>;
    summary?: {
      reviewCount: number;
      averageRating: number;
      distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
    };
    dashboard?: {
      totalCourses: number;
      draftCourses: number;
      publishedCourses: number;
      archivedCourses: number;
      totalEnrollments: number;
      totalReviews: number;
      averageRating: number;
      topCourses: Array<{
        slug: string;
      }>;
    };
  };
};

const users = userRepositoryMock as RepositoryMock<typeof userRepositoryMock>;
const courses = courseRepositoryMock as RepositoryMock<typeof courseRepositoryMock>;
const enrollments = enrollmentRepositoryMock as RepositoryMock<
  typeof enrollmentRepositoryMock
>;
const reviews = reviewRepositoryMock as RepositoryMock<typeof reviewRepositoryMock>;

const studentId = "64f1a2b3c4d5e6f789012345";
const instructorId = "64f1a2b3c4d5e6f789012346";
const otherInstructorId = "64f1a2b3c4d5e6f789012347";
const courseId = "64f1a2b3c4d5e6f789012348";
const enrollmentId = "64f1a2b3c4d5e6f789012349";
const reviewId = "64f1a2b3c4d5e6f789012350";

const createUserDocument = (
  overrides: Partial<IUser> = {},
  documentId = studentId,
): UserDocument =>
  ({
    _id: {
      toString: () => documentId,
    },
    firstName: "Amina",
    lastName: "Ndi",
    username: "amina_ndi",
    email: "secret@example.com",
    passwordHash: "secret",
    role: "student",
    status: "active",
    emailVerified: false,
    avatarUrl: null,
    bio: null,
    phoneNumber: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  }) as UserDocument;

const createCourseDocument = (
  overrides: Partial<ICourse> = {},
): CourseDocument =>
  ({
    _id: {
      toString: () => courseId,
    },
    title: "Introduction to Programming",
    slug: "introduction-to-programming",
    shortDescription: "Learn programming fundamentals with examples.",
    description:
      "This beginner course teaches practical programming foundations for university students and independent learners.",
    category: {
      _id: "64f1a2b3c4d5e6f789012351",
      name: "Programming",
      slug: "programming",
      description: null,
      icon: null,
    },
    instructor: {
      _id: instructorId,
      firstName: "Teach",
      lastName: "One",
      username: "teach_one",
      avatarUrl: null,
      bio: null,
      email: "hidden@example.com",
      status: "active",
      passwordHash: "secret",
    },
    level: "beginner",
    language: "English",
    thumbnailUrl: "https://example.com/course.jpg",
    isFree: true,
    price: 0,
    currency: "XAF",
    status: "published",
    modules: [
      {
        _id: {
          toString: () => "64f1a2b3c4d5e6f789012352",
        },
        title: "Module One",
        description: "Intro",
        textContent: "Full learning text",
        videoUrl: "https://example.com/video",
        resourceUrl: "https://example.com/resource.pdf",
        order: 0,
        isPreview: false,
      },
    ],
    averageRating: 4.5,
    reviewCount: 2,
    enrollmentCount: 10,
    publishedAt: new Date("2026-02-01T00:00:00.000Z"),
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  }) as CourseDocument;

const createEnrollmentDocument = (
  overrides: Partial<IEnrollment> = {},
): EnrollmentDocument =>
  ({
    _id: {
      toString: () => enrollmentId,
    },
    student: {
      _id: studentId,
      firstName: "Amina",
      lastName: "Ndi",
      username: "amina_ndi",
      avatarUrl: null,
      bio: null,
      email: "hidden@example.com",
      passwordHash: "secret",
    },
    course: createCourseDocument(),
    status: "active",
    progressPercentage: 25,
    lastAccessedAt: null,
    completedAt: null,
    enrolledAt: new Date("2026-03-01T00:00:00.000Z"),
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
    updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    ...overrides,
  }) as EnrollmentDocument;

const createReviewDocument = (
  overrides: Partial<IReview> = {},
): ReviewDocument =>
  ({
    _id: {
      toString: () => reviewId,
    },
    student: {
      _id: studentId,
      firstName: "Amina",
      lastName: "Ndi",
      username: "amina_ndi",
      avatarUrl: null,
      bio: null,
      email: "hidden@example.com",
      passwordHash: "secret",
    },
    course: courseId,
    rating: 5,
    comment: "This course was very useful.",
    createdAt: new Date("2026-03-02T00:00:00.000Z"),
    updatedAt: new Date("2026-03-02T00:00:00.000Z"),
    ...overrides,
  }) as ReviewDocument;

describe("learning domain routes", () => {
  let app: Express;
  let studentToken: string;
  let instructorToken: string;

  beforeAll(async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("MONGODB_URI", "mongodb://127.0.0.1:27017/educonnect-test");
    vi.stubEnv(
      "JWT_ACCESS_SECRET",
      "test-access-secret-with-at-least-32-characters",
    );
    vi.stubEnv("JWT_ACCESS_EXPIRES_IN", "15m");

    const [{ app: importedApp }, { generateAccessToken }] = await Promise.all([
      import("../src/app.js"),
      import("../src/utils/jwt.js"),
    ]);

    app = importedApp;
    studentToken = generateAccessToken({
      userId: studentId,
      email: "student@example.com",
      role: "student",
    });
    instructorToken = generateAccessToken({
      userId: instructorId,
      email: "instructor@example.com",
      role: "instructor",
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    users.findById.mockImplementation((userId: string) => {
      if (userId === instructorId) {
        return Promise.resolve(
          createUserDocument({ role: "instructor" }, instructorId),
        );
      }

      return Promise.resolve(createUserDocument());
    });
    courses.findById.mockResolvedValue(createCourseDocument());
    courses.findPublishedById.mockResolvedValue(createCourseDocument());
    courses.incrementEnrollmentCount.mockResolvedValue(
      createCourseDocument({ enrollmentCount: 11 }),
    );
    courses.findByIdForInstructor.mockResolvedValue(createCourseDocument());
    courses.findByInstructor.mockResolvedValue([
      createCourseDocument({ slug: "top", enrollmentCount: 30, reviewCount: 5 }),
      createCourseDocument({
        slug: "second",
        enrollmentCount: 20,
        reviewCount: 4,
        averageRating: 5,
      }),
      createCourseDocument({ slug: "draft", status: "draft", enrollmentCount: 0 }),
      createCourseDocument({
        slug: "archived",
        status: "archived",
        enrollmentCount: 1,
      }),
    ]);
    enrollments.findByStudentAndCourse.mockResolvedValue(null);
    enrollments.create.mockResolvedValue(createEnrollmentDocument());
    enrollments.findStudentEnrollments.mockResolvedValue([
      createEnrollmentDocument(),
    ]);
    enrollments.countStudentEnrollments.mockResolvedValue(1);
    enrollments.findByStudentAndCourseWithCourse.mockResolvedValue(
      createEnrollmentDocument(),
    );
    enrollments.updateLastAccessed.mockResolvedValue(
      createEnrollmentDocument({
        lastAccessedAt: new Date("2026-03-03T00:00:00.000Z"),
      }),
    );
    enrollments.findCourseEnrollments.mockResolvedValue([
      createEnrollmentDocument(),
    ]);
    enrollments.countCourseEnrollments.mockResolvedValue(1);
    enrollments.findRecentByCourseIds.mockResolvedValue([
      createEnrollmentDocument(),
    ]);
    reviews.findByStudentAndCourse.mockResolvedValue(null);
    reviews.create.mockResolvedValue(createReviewDocument());
    reviews.updateByStudentAndCourse.mockResolvedValue(
      createReviewDocument({ rating: 4, comment: "Updated helpful review." }),
    );
    reviews.deleteByStudentAndCourse.mockResolvedValue(createReviewDocument());
    reviews.findByCourse.mockResolvedValue([createReviewDocument()]);
    reviews.countByCourse.mockResolvedValue(1);
    reviews.calculateSummary.mockResolvedValue({
      reviewCount: 2,
      averageRating: 4.5,
      distribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 1,
        5: 1,
      },
    });
    reviews.findRecentByCourseIds.mockResolvedValue([createReviewDocument()]);
    courses.updateReviewStats.mockResolvedValue(createCourseDocument());
  });

  it("lets a student enroll in a published course", async () => {
    const response = await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ student: instructorId })
      .expect(201);
    const body = response.body as ApiResponse;

    expect(body.message).toBe("Enrolment completed successfully");
    const createdEnrollment = enrollments.create.mock.calls[0]?.[0] as {
      student: { toString(): string };
    };
    expect(createdEnrollment.student.toString()).toBe(studentId);
  });

  it("rejects unauthenticated enrollment", async () => {
    await request(app).post(`/api/v1/courses/${courseId}/enroll`).expect(401);
  });

  it("rejects instructor enrollment", async () => {
    await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(403);
  });

  it("rejects draft and archived course enrollment", async () => {
    courses.findById.mockResolvedValueOnce(createCourseDocument({ status: "draft" }));
    await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(400);

    courses.findById.mockResolvedValueOnce(
      createCourseDocument({ status: "archived" }),
    );
    await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(400);
  });

  it("rejects duplicate enrollment and increments once only after create", async () => {
    enrollments.findByStudentAndCourse.mockResolvedValueOnce(
      createEnrollmentDocument(),
    );

    await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(409);
    expect(courses.incrementEnrollmentCount).not.toHaveBeenCalled();

    enrollments.findByStudentAndCourse.mockResolvedValueOnce(null);
    await request(app)
      .post(`/api/v1/courses/${courseId}/enroll`)
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(201);
    expect(courses.incrementEnrollmentCount).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid course id", async () => {
    await request(app)
      .post("/api/v1/courses/not-an-id/enroll")
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(400);
  });

  it("lists only the student's enrollments with filters and hides module content", async () => {
    const response = await request(app)
      .get("/api/v1/students/me/enrollments?status=active&sort=progress&page=1")
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(200);
    const body = response.body as ApiResponse;

    expect(enrollments.findStudentEnrollments).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId,
        status: "active",
        sort: "progress",
      }),
    );
    expect(body.data?.enrollments?.[0]?.course.modules).toBeUndefined();
  });

  it("rejects non-enrolled course details", async () => {
    enrollments.findByStudentAndCourseWithCourse.mockResolvedValue(null);

    await request(app)
      .get(`/api/v1/students/me/enrollments/${courseId}`)
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(404);
  });

  it("returns full learning content and updates lastAccessedAt", async () => {
    const response = await request(app)
      .get(`/api/v1/students/me/enrollments/${courseId}`)
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.enrollment?.course.modules?.[0]?.textContent).toBe(
      "Full learning text",
    );
    expect(enrollments.updateLastAccessed).toHaveBeenCalledWith(enrollmentId);
  });

  it("lets an enrolled student create a review", async () => {
    enrollments.findByStudentAndCourse.mockResolvedValue(createEnrollmentDocument());

    const response = await request(app)
      .post(`/api/v1/courses/${courseId}/reviews`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ rating: 5, comment: "This course was very useful." })
      .expect(201);
    const body = response.body as ApiResponse;

    expect(body.data?.review?.rating).toBe(5);
    expect(courses.updateReviewStats).toHaveBeenCalledWith(courseId, {
      averageRating: 4.5,
      reviewCount: 2,
    });
  });

  it("rejects non-enrolled student, instructor, duplicate review, invalid rating, and short comment", async () => {
    enrollments.findByStudentAndCourse.mockResolvedValueOnce(null);
    await request(app)
      .post(`/api/v1/courses/${courseId}/reviews`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ rating: 5, comment: "This course was very useful." })
      .expect(403);

    await request(app)
      .post(`/api/v1/courses/${courseId}/reviews`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .send({ rating: 5, comment: "This course was very useful." })
      .expect(403);

    enrollments.findByStudentAndCourse.mockResolvedValue(createEnrollmentDocument());
    reviews.findByStudentAndCourse.mockResolvedValueOnce(createReviewDocument());
    await request(app)
      .post(`/api/v1/courses/${courseId}/reviews`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ rating: 5, comment: "This course was very useful." })
      .expect(409);

    await request(app)
      .post(`/api/v1/courses/${courseId}/reviews`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ rating: 6, comment: "This course was very useful." })
      .expect(400);

    await request(app)
      .post(`/api/v1/courses/${courseId}/reviews`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ rating: 5, comment: "Short" })
      .expect(400);
  });

  it("updates and deletes my review while recalculating aggregates", async () => {
    await request(app)
      .patch(`/api/v1/courses/${courseId}/reviews/me`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ rating: 4 })
      .expect(200);

    reviews.calculateSummary.mockResolvedValueOnce({
      reviewCount: 0,
      averageRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
    await request(app)
      .delete(`/api/v1/courses/${courseId}/reviews/me`)
      .set("Authorization", `Bearer ${studentToken}`)
      .expect(204);

    expect(courses.updateReviewStats).toHaveBeenLastCalledWith(courseId, {
      averageRating: 0,
      reviewCount: 0,
    });
  });

  it("lists public reviews with safe student fields and distribution", async () => {
    const response = await request(app)
      .get(`/api/v1/courses/${courseId}/reviews?sort=highest`)
      .expect(200);
    const body = response.body as ApiResponse;

    expect(body.data?.reviews?.[0]?.student.email).toBeUndefined();
    expect(body.data?.reviews?.[0]?.student.passwordHash).toBeUndefined();
    expect(body.data?.summary).toMatchObject({
      reviewCount: 2,
      averageRating: 4.5,
      distribution: { 4: 1, 5: 1 },
    });
  });

  it("protects instructor course enrollment and review lists by ownership", async () => {
    courses.findByIdForInstructor.mockResolvedValueOnce(null);
    await request(app)
      .get(`/api/v1/instructor/courses/${courseId}/enrollments`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(404);

    courses.findByIdForInstructor.mockResolvedValueOnce(null);
    await request(app)
      .get(`/api/v1/instructor/courses/${courseId}/reviews`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(404);
  });

  it("returns instructor course enrollment and review lists safely", async () => {
    const enrollmentResponse = await request(app)
      .get(`/api/v1/instructor/courses/${courseId}/enrollments?status=active`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(200);
    const enrollmentBody = enrollmentResponse.body as ApiResponse;

    expect(enrollmentBody.data?.enrollments?.[0]?.student?.email).toBeUndefined();

    const reviewResponse = await request(app)
      .get(`/api/v1/instructor/courses/${courseId}/reviews`)
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(200);
    const reviewBody = reviewResponse.body as ApiResponse;

    expect(reviewBody.data?.reviews?.[0]?.student.passwordHash).toBeUndefined();
  });

  it("returns instructor dashboard totals and sorted top courses for owned courses only", async () => {
    courses.findByInstructor.mockResolvedValue([
      createCourseDocument({ slug: "low", enrollmentCount: 1, reviewCount: 1 }),
      createCourseDocument({
        slug: "top",
        enrollmentCount: 10,
        reviewCount: 4,
        averageRating: 5,
      }),
      createCourseDocument({
        slug: "draft",
        status: "draft",
        enrollmentCount: 0,
        reviewCount: 0,
      }),
    ]);

    const response = await request(app)
      .get("/api/v1/instructor/dashboard")
      .set("Authorization", `Bearer ${instructorToken}`)
      .expect(200);
    const body = response.body as ApiResponse;

    expect(courses.findByInstructor).toHaveBeenCalledWith(instructorId);
    expect(body.data?.dashboard).toMatchObject({
      totalCourses: 3,
      draftCourses: 1,
      publishedCourses: 2,
      archivedCourses: 0,
      totalEnrollments: 11,
      totalReviews: 5,
    });
    expect(body.data?.dashboard?.topCourses[0]?.slug).toBe("top");
  });
});
