import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { listCategoriesRequest } from '../../api/category.api';
import { listPublicCoursesRequest } from '../../api/course.api';
import {
  CourseFilters,
  type CourseFilterState,
} from '../../components/courses/CourseFilters';
import { CourseCard } from '../../components/courses/CourseCard';
import { Button } from '../../components/common/Button';
import { Container } from '../../components/common/Container';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorMessage } from '../../components/feedback/ErrorMessage';
import { SkeletonBlock } from '../../components/feedback/SkeletonBlock';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import type { Category, Course, CourseLevel, CourseListData, CourseSort } from '../../types/course';
import { getErrorMessage } from '../../utils/errors';

const fromSearchParams = (params: URLSearchParams): CourseFilterState => ({
  search: params.get('search') ?? '',
  category: params.get('category') ?? '',
  level: (params.get('level') as CourseLevel | null) ?? '',
  price:
    params.get('isFree') === 'true'
      ? 'free'
      : params.get('isFree') === 'false'
        ? 'paid'
        : '',
  minPrice: params.get('minPrice') ?? '',
  maxPrice: params.get('maxPrice') ?? '',
  language: params.get('language') ?? '',
  sort: (params.get('sort') as CourseSort | null) ?? 'newest',
});

export function CourseCataloguePage() {
  useDocumentTitle('Courses');
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<CourseFilterState>(() =>
    fromSearchParams(searchParams),
  );
  const [data, setData] = useState<CourseListData | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const page = Number(searchParams.get('page') ?? '1');
  const debouncedSearch = useDebounce(filters.search);

  const query = useMemo(
    () => ({
      page,
      limit: 9,
      search: debouncedSearch || undefined,
      category: filters.category || undefined,
      level: filters.level || undefined,
      isFree:
        filters.price === 'free'
          ? true
          : filters.price === 'paid'
            ? false
            : undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      language: filters.language || undefined,
      sort: filters.sort,
    }),
    [debouncedSearch, filters, page],
  );

  useEffect(() => {
    const nextParams = new URLSearchParams();
    Object.entries({
      search: filters.search,
      category: filters.category,
      level: filters.level,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      language: filters.language,
      sort: filters.sort === 'newest' ? '' : filters.sort,
    }).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      }
    });

    if (filters.price) {
      nextParams.set('isFree', filters.price === 'free' ? 'true' : 'false');
    }

    if (page > 1) {
      nextParams.set('page', String(page));
    }

    setSearchParams(nextParams, { replace: true });
  }, [filters, page, setSearchParams]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setStatus('loading');
      setError(null);

      try {
        const [categoryList, courseList] = await Promise.all([
          listCategoriesRequest(),
          listPublicCoursesRequest(query),
        ]);

        if (isMounted) {
          setCategories(categoryList);
          setData(courseList);
          setStatus('success');
        }
      } catch (loadError) {
        if (isMounted) {
          setError(getErrorMessage(loadError));
          setStatus('error');
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const updateFilters = (nextFilters: CourseFilterState) => {
    setFilters(nextFilters);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('page');
      return next;
    });
  };

  const retry = () => {
    setStatus('loading');
    void listPublicCoursesRequest(query)
      .then((courseList) => {
        setData(courseList);
        setStatus('success');
      })
      .catch((retryError) => {
        setError(getErrorMessage(retryError));
        setStatus('error');
      });
  };

  return (
    <main>
      <Container className="py-8">
        <header className="reveal-up mb-6 rounded-lg border border-slate-200 bg-white/85 p-5 shadow-sm backdrop-blur">
          <p className="text-sm font-bold uppercase text-brand-blue">Course catalogue</p>
          <h1 className="mt-2 text-4xl font-extrabold text-brand-navy">All courses</h1>
          <p className="mt-2 max-w-2xl text-text-secondary">
            Browse published courses, filter by price or level, and find content
            that works for your learning goals.
          </p>
        </header>
        <CourseFilters categories={categories} filters={filters} onChange={updateFilters} />
        <div className="mt-6">
          {status === 'loading' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <SkeletonBlock className="h-80" key={index} />
              ))}
            </div>
          ) : null}
          {status === 'error' ? (
            <ErrorMessage
              action={<Button onClick={retry}>Retry</Button>}
              message={error ?? 'Courses could not be loaded.'}
              title="Unable to load courses"
            />
          ) : null}
          {status === 'success' && data?.courses.length === 0 ? (
            <EmptyState
              message="Try a different search, category, level, or price filter."
              title="No courses found"
            />
          ) : null}
          {status === 'success' && data && data.courses.length > 0 ? (
            <>
              <div className="mb-4 text-sm font-bold text-text-secondary">
                Showing {data.courses.length} of {data.pagination.totalItems} courses
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.courses.map((course: Course) => (
                  <CourseCard course={course} key={course.id} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination
                  onPageChange={(nextPage) => {
                    const nextParams = new URLSearchParams(searchParams);
                    nextParams.set('page', String(nextPage));
                    setSearchParams(nextParams);
                  }}
                  pagination={data.pagination}
                />
              </div>
            </>
          ) : null}
        </div>
      </Container>
    </main>
  );
}
