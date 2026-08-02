import type { Types } from "mongoose";

import {
  categoryRepository,
  type CategoryRepository,
} from "../repositories/category.repository.js";
import {
  courseRepository,
  type CourseRepository,
  type PublicCourseFilters,
} from "../repositories/course.repository.js";
import type { ICourseModule, CourseDocument } from "../types/course.js";
import type { UserRole } from "../types/user.js";
import { AppError } from "../utils/app-error.js";
import { isValidObjectId, toObjectId } from "../utils/object-id.js";
import { resolveSlugCollision } from "../utils/slug.js";
import type {
  CreateCourseInput,
  InstructorCourseQuery,
  PublicCourseQuery,
  UpdateCourseInput,
} from "../validators/course.validator.js";

type SafeCategoryResponse = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
};

type SafeInstructorResponse = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
};

type ModuleResponse = {
  id: string;
  title: string;
  description: string | null;
  textContent: string | null;
  videoUrl: string | null;
  resourceUrl: string | null;
  order: number;
  isPreview: boolean;
};

type PublicModuleResponse =
  | ModuleResponse
  | Pick<ModuleResponse, "description" | "id" | "isPreview" | "order" | "title">;

type CourseResponse = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: SafeCategoryResponse;
  instructor: SafeInstructorResponse;
  level: string;
  language: string;
  thumbnailUrl: string | null;
  isFree: boolean;
  price: number;
  currency: string;
  status: string;
  modules: ModuleResponse[];
  moduleCount: number;
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type PublicCourseListItem = Omit<
  CourseResponse,
  "description" | "modules" | "status"
>;

type PublicCourseDetails = Omit<CourseResponse, "modules" | "status"> & {
  modules: PublicModuleResponse[];
};

type PaginationResponse = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type CourseListResponse<TCourse> = {
  courses: TCourse[];
  pagination: PaginationResponse;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getStringField = (
  value: Record<string, unknown>,
  key: string,
): string | null => {
  const fieldValue = value[key];

  return typeof fieldValue === "string" ? fieldValue : null;
};

const getId = (value: unknown): string => {
  if (isRecord(value) && value._id) {
    return String(value._id);
  }

  return String(value);
};

export class CourseService {
  public constructor(
    private readonly courses: CourseRepository = courseRepository,
    private readonly categories: CategoryRepository = categoryRepository,
  ) {}

  public async createInstructorCourse(
    instructorId: string,
    input: CreateCourseInput,
  ): Promise<CourseResponse> {
    const category = await this.getActiveCategory(input.categoryId);
    const slug = await resolveSlugCollision(input.title, (candidateSlug) =>
      this.courses.existsBySlug(candidateSlug),
    );

    const course = await this.courses.create({
      title: input.title,
      slug,
      shortDescription: input.shortDescription,
      description: input.description,
      category: category._id as Types.ObjectId,
      instructor: toObjectId(instructorId),
      level: input.level,
      language: input.language,
      thumbnailUrl: input.thumbnailUrl ?? null,
      isFree: input.isFree,
      price: input.price,
      currency: "XAF",
      status: "draft",
      modules: this.normalizeModules(input.modules),
      averageRating: 0,
      reviewCount: 0,
      enrollmentCount: 0,
      publishedAt: null,
    });

    return this.toCourseResponse(course);
  }

  public async listInstructorCourses(
    instructorId: string,
    query: InstructorCourseQuery,
  ): Promise<CourseListResponse<CourseResponse>> {
    const filters = {
      instructorId,
      page: query.page,
      limit: query.limit,
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.search !== undefined ? { search: query.search } : {}),
    };

    const countFilters = {
      instructorId,
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.search !== undefined ? { search: query.search } : {}),
    };

    const [courses, totalItems] = await Promise.all([
      this.courses.findInstructorCourses(filters),
      this.courses.countInstructorCourses(countFilters),
    ]);

    return {
      courses: courses.map((course) => this.toCourseResponse(course)),
      pagination: this.toPagination(query.page, query.limit, totalItems),
    };
  }

  public async getInstructorCourse(
    instructorId: string,
    courseId: string,
  ): Promise<CourseResponse> {
    this.assertValidCourseId(courseId);

    const course = await this.courses.findByIdForInstructor(
      courseId,
      instructorId,
    );

    if (!course) {
      throw new AppError("Course not found.", 404);
    }

    return this.toCourseResponse(course);
  }

  public async updateInstructorCourse(
    instructorId: string,
    courseId: string,
    input: UpdateCourseInput,
  ): Promise<CourseResponse> {
    this.assertValidCourseId(courseId);

    const existingCourse = await this.courses.findByIdForInstructor(
      courseId,
      instructorId,
    );

    if (!existingCourse) {
      throw new AppError("Course not found.", 404);
    }

    const updateInput = await this.toUpdateCourseInput(existingCourse, input);
    const updatedCourse = await this.courses.updateByIdForInstructor(
      courseId,
      instructorId,
      updateInput,
    );

    if (!updatedCourse) {
      throw new AppError("Course not found.", 404);
    }

    return this.toCourseResponse(updatedCourse);
  }

  public async publishInstructorCourse(
    instructorId: string,
    courseId: string,
  ): Promise<CourseResponse> {
    const course = await this.getOwnedCourseDocument(instructorId, courseId);

    if (course.status === "published") {
      throw new AppError("Course is already published.", 409);
    }

    if (course.status === "archived") {
      throw new AppError("Archived courses cannot be published.", 409);
    }

    if (course.modules.length === 0) {
      throw new AppError("Course must have at least one module before publishing.", 400);
    }

    const updatedCourse = await this.courses.publishByIdForInstructor(
      courseId,
      instructorId,
    );

    if (!updatedCourse) {
      throw new AppError("Course not found.", 404);
    }

    return this.toCourseResponse(updatedCourse);
  }

  public async archiveInstructorCourse(
    instructorId: string,
    courseId: string,
  ): Promise<CourseResponse> {
    const course = await this.getOwnedCourseDocument(instructorId, courseId);

    if (course.status === "archived") {
      throw new AppError("Course is already archived.", 409);
    }

    const updatedCourse = await this.courses.archiveByIdForInstructor(
      courseId,
      instructorId,
    );

    if (!updatedCourse) {
      throw new AppError("Course not found.", 404);
    }

    return this.toCourseResponse(updatedCourse);
  }

  public async deleteInstructorCourse(
    instructorId: string,
    courseId: string,
  ): Promise<void> {
    const course = await this.getOwnedCourseDocument(instructorId, courseId);

    if (course.status !== "draft" || course.enrollmentCount > 0) {
      throw new AppError(
        "Only draft courses without enrollments can be permanently deleted.",
        409,
      );
    }

    await this.courses.deleteByIdForInstructor(courseId, instructorId);
  }

  public async listPublicCourses(
    query: PublicCourseQuery,
  ): Promise<CourseListResponse<PublicCourseListItem>> {
    const categoryId = await this.resolveCategoryFilter(query.category);

    if (query.category && !categoryId) {
      return {
        courses: [],
        pagination: this.toPagination(query.page, query.limit, 0),
      };
    }

    const filters: PublicCourseFilters = {
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      ...(query.search !== undefined ? { search: query.search } : {}),
      ...(categoryId !== undefined ? { categoryId } : {}),
      ...(query.level !== undefined ? { level: query.level } : {}),
      ...(query.isFree !== undefined ? { isFree: query.isFree } : {}),
      ...(query.minPrice !== undefined ? { minPrice: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { maxPrice: query.maxPrice } : {}),
      ...(query.language !== undefined ? { language: query.language } : {}),
    };

    const [courses, totalItems] = await Promise.all([
      this.courses.findPublicCourses(filters),
      this.courses.countPublicCourses(filters),
    ]);

    return {
      courses: courses.map((course) => this.toPublicCourseListItem(course)),
      pagination: this.toPagination(query.page, query.limit, totalItems),
    };
  }

  public async getPublicCourseDetails(
    slug: string,
  ): Promise<PublicCourseDetails> {
    const course = await this.courses.findPublishedBySlug(slug);

    if (!course) {
      throw new AppError("Course not found.", 404);
    }

    return this.toPublicCourseDetails(course);
  }

  private async getActiveCategory(categoryId: string) {
    if (!isValidObjectId(categoryId)) {
      throw new AppError("Category id is invalid.", 400);
    }

    const category = await this.categories.findActiveById(categoryId);

    if (!category) {
      throw new AppError("Category must exist and be active.", 400);
    }

    return category;
  }

  private async getOwnedCourseDocument(
    instructorId: string,
    courseId: string,
  ): Promise<CourseDocument> {
    this.assertValidCourseId(courseId);

    const course = await this.courses.findByIdForInstructor(
      courseId,
      instructorId,
    );

    if (!course) {
      throw new AppError("Course not found.", 404);
    }

    return course;
  }

  private assertValidCourseId(courseId: string): void {
    if (!isValidObjectId(courseId)) {
      throw new AppError("Course id is invalid.", 400);
    }
  }

  private async toUpdateCourseInput(
    course: CourseDocument,
    input: UpdateCourseInput,
  ) {
    const updateInput: Partial<{
      title: string;
      slug: string;
      shortDescription: string;
      description: string;
      category: Types.ObjectId;
      level: CourseDocument["level"];
      language: string;
      thumbnailUrl: string | null;
      isFree: boolean;
      price: number;
      modules: ICourseModule[];
    }> = {};

    if (input.title !== undefined && input.title !== course.title) {
      updateInput.title = input.title;
      updateInput.slug = await resolveSlugCollision(input.title, (candidateSlug) =>
        this.courses.existsBySlugExcludingCourse(candidateSlug, course._id.toString()),
      );
    }

    if (input.shortDescription !== undefined) {
      updateInput.shortDescription = input.shortDescription;
    }

    if (input.description !== undefined) {
      updateInput.description = input.description;
    }

    if (input.categoryId !== undefined) {
      const category = await this.getActiveCategory(input.categoryId);
      updateInput.category = category._id as Types.ObjectId;
    }

    if (input.level !== undefined) {
      updateInput.level = input.level;
    }

    if (input.language !== undefined) {
      updateInput.language = input.language;
    }

    if (input.thumbnailUrl !== undefined) {
      updateInput.thumbnailUrl = input.thumbnailUrl;
    }

    const nextIsFree = input.isFree ?? course.isFree;
    const nextPrice = input.price ?? course.price;

    if (nextPrice < 0) {
      throw new AppError("Price cannot be negative.", 400);
    }

    if (nextIsFree && nextPrice !== 0) {
      throw new AppError("Free courses must have a price of 0.", 400);
    }

    if (!nextIsFree && nextPrice <= 0) {
      throw new AppError("Paid courses must have a price greater than 0.", 400);
    }

    if (input.isFree !== undefined) {
      updateInput.isFree = input.isFree;
    }

    if (input.price !== undefined) {
      updateInput.price = input.price;
    }

    if (input.modules !== undefined) {
      updateInput.modules = this.normalizeModules(input.modules);
    }

    return updateInput;
  }

  private normalizeModules(modules: CreateCourseInput["modules"]): ICourseModule[] {
    return modules.map((module, index) => ({
      title: module.title,
      description: module.description ?? null,
      textContent: module.textContent ?? null,
      videoUrl: module.videoUrl ?? null,
      resourceUrl: module.resourceUrl ?? null,
      order: index,
      isPreview: module.isPreview,
    }));
  }

  private async resolveCategoryFilter(
    categorySlug?: string,
  ): Promise<string | undefined> {
    if (!categorySlug) {
      return undefined;
    }

    const category = await this.categories.findActiveBySlug(categorySlug);

    return category?._id.toString();
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

  private toCourseResponse(course: CourseDocument): CourseResponse {
    return {
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      description: course.description,
      category: this.toSafeCategory(course.category),
      instructor: this.toSafeInstructor(course.instructor),
      level: course.level,
      language: course.language,
      thumbnailUrl: course.thumbnailUrl ?? null,
      isFree: course.isFree,
      price: course.price,
      currency: course.currency,
      status: course.status,
      modules: course.modules
        .map((module) => this.toModuleResponse(module))
        .sort((left, right) => left.order - right.order),
      moduleCount: course.modules.length,
      averageRating: course.averageRating,
      reviewCount: course.reviewCount,
      enrollmentCount: course.enrollmentCount,
      publishedAt: course.publishedAt?.toISOString() ?? null,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    };
  }

  private toPublicCourseListItem(course: CourseDocument): PublicCourseListItem {
    const courseResponse = this.toCourseResponse(course);

    return {
      id: courseResponse.id,
      title: courseResponse.title,
      slug: courseResponse.slug,
      shortDescription: courseResponse.shortDescription,
      category: courseResponse.category,
      instructor: courseResponse.instructor,
      level: courseResponse.level,
      language: courseResponse.language,
      thumbnailUrl: courseResponse.thumbnailUrl,
      isFree: courseResponse.isFree,
      price: courseResponse.price,
      currency: courseResponse.currency,
      moduleCount: courseResponse.moduleCount,
      averageRating: courseResponse.averageRating,
      reviewCount: courseResponse.reviewCount,
      enrollmentCount: courseResponse.enrollmentCount,
      publishedAt: courseResponse.publishedAt,
      createdAt: courseResponse.createdAt,
      updatedAt: courseResponse.updatedAt,
    };
  }

  private toPublicCourseDetails(course: CourseDocument): PublicCourseDetails {
    const courseResponse = this.toCourseResponse(course);

    return {
      ...this.toPublicCourseListItem(course),
      description: courseResponse.description,
      modules: courseResponse.modules.map((module) =>
        module.isPreview
          ? module
          : {
              id: module.id,
              title: module.title,
              description: module.description,
              order: module.order,
              isPreview: module.isPreview,
            },
      ),
    };
  }

  private toModuleResponse(module: ICourseModule): ModuleResponse {
    return {
      id: module._id?.toString() ?? "",
      title: module.title,
      description: module.description ?? null,
      textContent: module.textContent ?? null,
      videoUrl: module.videoUrl ?? null,
      resourceUrl: module.resourceUrl ?? null,
      order: module.order,
      isPreview: module.isPreview,
    };
  }

  private toSafeCategory(value: unknown): SafeCategoryResponse {
    if (isRecord(value)) {
      return {
        id: getId(value),
        name: getStringField(value, "name") ?? "",
        slug: getStringField(value, "slug") ?? "",
        description: getStringField(value, "description"),
        icon: getStringField(value, "icon"),
      };
    }

    return {
      id: String(value),
      name: "",
      slug: "",
      description: null,
      icon: null,
    };
  }

  private toSafeInstructor(value: unknown): SafeInstructorResponse {
    if (isRecord(value)) {
      return {
        id: getId(value),
        firstName: getStringField(value, "firstName") ?? "",
        lastName: getStringField(value, "lastName") ?? "",
        username: getStringField(value, "username") ?? "",
        avatarUrl: getStringField(value, "avatarUrl"),
        bio: getStringField(value, "bio"),
      };
    }

    return {
      id: String(value),
      firstName: "",
      lastName: "",
      username: "",
      avatarUrl: null,
      bio: null,
    };
  }
}

export const courseService = new CourseService();
