import { BookOpen, Heart, Layers3, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { RatingStars } from '../common/RatingStars';
import type { Course } from '../../types/course';
import { formatXaf } from '../../utils/currency';

type CourseCardProps = {
  course: Course;
  href?: string;
};

const levelLabels: Record<Course['level'], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  'all-levels': 'All levels',
};

export function CourseCard({ course, href = `/courses/${course.slug}` }: CourseCardProps) {
  return (
    <Card className="group overflow-hidden p-0">
      <Link className="block focus:outline-none" to={href}>
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-brand-navy to-brand-blue">
          {course.thumbnailUrl ? (
            <img
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              src={course.thumbnailUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-white">
              <BookOpen aria-hidden="true" className="h-10 w-10" />
            </div>
          )}
          <Badge className="absolute left-3 top-3" tone={course.isFree ? 'green' : 'amber'}>
            {course.isFree ? 'Free' : formatXaf(course.price)}
          </Badge>
          <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-brand-navy shadow-sm backdrop-blur transition group-hover:bg-white group-hover:text-brand-blue">
            <Heart aria-hidden="true" className="h-4 w-4" />
          </span>
          <div className="course-media-overlay absolute inset-x-0 bottom-0 px-4 py-3 text-xs font-bold text-white">
            {course.moduleCount} lessons · {course.language}
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            <Badge tone="blue">{course.category.name || 'Course'}</Badge>
            <Badge>{levelLabels[course.level]}</Badge>
          </div>
          <h3 className="mt-3 line-clamp-2 text-base font-bold text-brand-navy">
            {course.title}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            {course.instructor.firstName} {course.instructor.lastName}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-secondary">
            {course.shortDescription}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-1 font-semibold text-text-primary">
              <RatingStars rating={course.averageRating} />
              {course.averageRating.toFixed(1)}
            </span>
            <span className="inline-flex items-center gap-1 text-text-secondary">
              <Users aria-hidden="true" className="h-4 w-4" />
              {course.enrollmentCount}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <Layers3 aria-hidden="true" className="h-4 w-4 text-brand-green" />
              {course.moduleCount} modules
            </span>
            <span className="text-brand-blue">View course</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
