export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type CourseSummary = {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
  level: CourseLevel;
  language: string;
  thumbnailUrl: string;
  priceXaf: number;
  isFree: boolean;
  averageRating: number;
  enrollmentCount: number;
};
