import type { SortOrder, UpdateQuery } from "mongoose";

import { Course } from "../models/course.model.js";
import type {
  CourseDocument,
  CourseLevel,
  CourseStatus,
  ICourse,
} from "../types/course.js";

export type CreateCourseInput = Omit<ICourse, "createdAt" | "updatedAt">;

export type UpdateCourseInput = Partial<
  Pick<
    ICourse,
    | "category"
    | "description"
    | "isFree"
    | "language"
    | "level"
    | "modules"
    | "price"
    | "shortDescription"
    | "slug"
    | "thumbnailUrl"
    | "title"
  >
>;

type PaginationInput = {
  page: number;
  limit: number;
};

export type InstructorCourseFilters = PaginationInput & {
  instructorId: string;
  status?: CourseStatus;
  search?: string;
};

export type PublicCourseFilters = PaginationInput & {
  search?: string;
  categoryId?: string;
  level?: CourseLevel;
  isFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
  language?: string;
  sort: "newest" | "oldest" | "price-asc" | "price-desc" | "rating" | "popular";
};

const safePopulate = [
  {
    path: "category",
    select: "name slug description icon",
  },
  {
    path: "instructor",
    select: "firstName lastName username avatarUrl bio",
  },
];

type CourseQuery = Record<string, unknown>;

type PriceQuery = {
  $gte?: number;
  $lte?: number;
};

const buildSearchFilter = (search?: string): CourseQuery => {
  if (!search) {
    return {};
  }

  return {
    $text: {
      $search: search.trim(),
    },
  };
};

const getPublicSort = (
  sort: PublicCourseFilters["sort"],
): Record<string, SortOrder> => {
  const sortMap: Record<PublicCourseFilters["sort"], Record<string, SortOrder>> = {
    newest: { publishedAt: -1 },
    oldest: { publishedAt: 1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    rating: { averageRating: -1 },
    popular: { enrollmentCount: -1 },
  };

  return sortMap[sort];
};

export class CourseRepository {
  public async create(input: CreateCourseInput): Promise<CourseDocument> {
    return Course.create(input);
  }

  public async existsBySlug(slug: string): Promise<boolean> {
    const result = await Course.exists({ slug }).exec();

    return result !== null;
  }

  public async existsBySlugExcludingCourse(
    slug: string,
    courseId: string,
  ): Promise<boolean> {
    const result = await Course.exists({
      slug,
      _id: { $ne: courseId },
    }).exec();

    return result !== null;
  }

  public async findInstructorCourses(
    filters: InstructorCourseFilters,
  ): Promise<CourseDocument[]> {
    const query: CourseQuery = {
      instructor: filters.instructorId,
      ...buildSearchFilter(filters.search),
    };

    if (filters.status) {
      query.status = filters.status;
    }

    return Course.find(query)
      .populate(safePopulate)
      .sort({ createdAt: -1 })
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .exec();
  }

  public async countInstructorCourses(
    filters: Omit<InstructorCourseFilters, "limit" | "page">,
  ): Promise<number> {
    const query: CourseQuery = {
      instructor: filters.instructorId,
      ...buildSearchFilter(filters.search),
    };

    if (filters.status) {
      query.status = filters.status;
    }

    return Course.countDocuments(query).exec();
  }

  public async findByIdForInstructor(
    courseId: string,
    instructorId: string,
  ): Promise<CourseDocument | null> {
    return Course.findOne({
      _id: courseId,
      instructor: instructorId,
    })
      .populate(safePopulate)
      .exec();
  }

  public async findById(courseId: string): Promise<CourseDocument | null> {
    return Course.findById(courseId)
      .populate(safePopulate)
      .exec();
  }

  public async findPublishedById(
    courseId: string,
  ): Promise<CourseDocument | null> {
    return Course.findOne({
      _id: courseId,
      status: "published",
    })
      .populate(safePopulate)
      .exec();
  }

  public async incrementEnrollmentCount(
    courseId: string,
  ): Promise<CourseDocument | null> {
    return Course.findByIdAndUpdate(
      courseId,
      {
        $inc: {
          enrollmentCount: 1,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate(safePopulate)
      .exec();
  }

  public async updateReviewStats(
    courseId: string,
    stats: {
      averageRating: number;
      reviewCount: number;
    },
  ): Promise<CourseDocument | null> {
    return Course.findByIdAndUpdate(
      courseId,
      {
        $set: stats,
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate(safePopulate)
      .exec();
  }

  public async findByInstructor(
    instructorId: string,
  ): Promise<CourseDocument[]> {
    return Course.find({ instructor: instructorId })
      .populate(safePopulate)
      .sort({ createdAt: -1 })
      .exec();
  }

  public async findIdsByTitleSearch(search: string): Promise<string[]> {
    const courses = await Course.find({
      $text: {
        $search: search.trim(),
      },
    })
      .select("_id")
      .exec();

    return courses.map((course) => course._id.toString());
  }

  public async updateByIdForInstructor(
    courseId: string,
    instructorId: string,
    input: UpdateCourseInput,
  ): Promise<CourseDocument | null> {
    return Course.findOneAndUpdate(
      {
        _id: courseId,
        instructor: instructorId,
      },
      input,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate(safePopulate)
      .exec();
  }

  public async publishByIdForInstructor(
    courseId: string,
    instructorId: string,
  ): Promise<CourseDocument | null> {
    const update: UpdateQuery<ICourse> = {
      $set: {
        status: "published",
        publishedAt: new Date(),
      },
    };

    return Course.findOneAndUpdate(
      {
        _id: courseId,
        instructor: instructorId,
      },
      update,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate(safePopulate)
      .exec();
  }

  public async archiveByIdForInstructor(
    courseId: string,
    instructorId: string,
  ): Promise<CourseDocument | null> {
    return Course.findOneAndUpdate(
      {
        _id: courseId,
        instructor: instructorId,
      },
      {
        $set: {
          status: "archived",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    )
      .populate(safePopulate)
      .exec();
  }

  public async deleteByIdForInstructor(
    courseId: string,
    instructorId: string,
  ): Promise<CourseDocument | null> {
    return Course.findOneAndDelete({
      _id: courseId,
      instructor: instructorId,
    }).exec();
  }

  public async findPublicCourses(
    filters: PublicCourseFilters,
  ): Promise<CourseDocument[]> {
    const query = await this.buildPublicQuery(filters);

    return Course.find(query)
      .populate(safePopulate)
      .sort(getPublicSort(filters.sort))
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .exec();
  }

  public async countPublicCourses(
    filters: Omit<PublicCourseFilters, "limit" | "page" | "sort">,
  ): Promise<number> {
    const query = await this.buildPublicQuery({
      ...filters,
      page: 1,
      limit: 1,
      sort: "newest",
    });

    return Course.countDocuments(query).exec();
  }

  public async findPublishedBySlug(
    slug: string,
  ): Promise<CourseDocument | null> {
    return Course.findOne({
      slug,
      status: "published",
    })
      .populate(safePopulate)
      .exec();
  }

  private async buildPublicQuery(
    filters: PublicCourseFilters,
  ): Promise<CourseQuery> {
    const query: CourseQuery = {
      status: "published",
      ...buildSearchFilter(filters.search),
    };

    if (filters.categoryId) {
      query.category = filters.categoryId;
    }

    if (filters.level) {
      query.level = filters.level;
    }

    if (filters.isFree !== undefined) {
      query.isFree = filters.isFree;
    }

    if (filters.language) {
      query.language = filters.language;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceQuery: PriceQuery = {};

      if (filters.minPrice !== undefined) {
        priceQuery.$gte = filters.minPrice;
      }

      if (filters.maxPrice !== undefined) {
        priceQuery.$lte = filters.maxPrice;
      }

      query.price = priceQuery;
    }

    return query;
  }
}

export const courseRepository = new CourseRepository();
