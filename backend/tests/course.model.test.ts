import { describe, expect, it } from "vitest";
import { Types } from "mongoose";

import { Course } from "../src/models/course.model.js";

const createCourseInput = (overrides: Record<string, unknown> = {}) => ({
  title: "Introduction to Programming",
  slug: "introduction-to-programming",
  shortDescription: "Learn programming fundamentals with practical examples.",
  description:
    "This beginner-friendly course introduces programming concepts, problem solving, and practical software development foundations for new learners.",
  category: new Types.ObjectId(),
  instructor: new Types.ObjectId(),
  level: "beginner",
  language: "English",
  thumbnailUrl: "https://example.com/course.jpg",
  isFree: true,
  price: 0,
  currency: "XAF",
  status: "draft",
  modules: [
    {
      title: "Getting Started",
      textContent: "Welcome to the course.",
      order: 0,
      isPreview: true,
    },
  ],
  ...overrides,
});

describe("Course model", () => {
  it("accepts a valid free course", async () => {
    const course = new Course(createCourseInput());

    await expect(course.validate()).resolves.toBeUndefined();
  });

  it("accepts a valid paid course", async () => {
    const course = new Course(
      createCourseInput({
        isFree: false,
        price: 15000,
      }),
    );

    await expect(course.validate()).resolves.toBeUndefined();
  });

  it("rejects a negative price", async () => {
    const course = new Course(createCourseInput({ price: -1 }));

    await expect(course.validate()).rejects.toThrow("Course price cannot be negative");
  });

  it("rejects a free course with non-zero price", async () => {
    const course = new Course(createCourseInput({ isFree: true, price: 1000 }));

    await expect(course.validate()).rejects.toThrow(
      "Free courses must have a price of 0",
    );
  });

  it("rejects a paid course with zero price", async () => {
    const course = new Course(createCourseInput({ isFree: false, price: 0 }));

    await expect(course.validate()).rejects.toThrow(
      "Paid courses must have a price greater than 0",
    );
  });

  it("rejects an invalid module", async () => {
    const course = new Course(
      createCourseInput({
        modules: [
          {
            title: "Empty Module",
            order: 0,
            isPreview: false,
          },
        ],
      }),
    );

    await expect(course.validate()).rejects.toThrow(
      "Each module must include text content",
    );
  });

  it("rejects invalid enum values", async () => {
    const course = new Course(createCourseInput({ level: "expert" }));

    await expect(course.validate()).rejects.toThrow("Course level is invalid");
  });

  it("enforces unique slug through schema indexes", () => {
    const slugIndex = Course.schema
      .indexes()
      .find(([fields]) => fields.slug === 1);

    expect(slugIndex?.[1]?.unique).toBe(true);
  });
});
