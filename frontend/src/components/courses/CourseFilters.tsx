import { Search, SlidersHorizontal } from 'lucide-react';

import { Input } from '../common/Input';
import { Select } from '../common/Select';
import type { Category, CourseLevel, CourseSort } from '../../types/course';

export type CourseFilterState = {
  search: string;
  category: string;
  level: '' | CourseLevel;
  price: '' | 'free' | 'paid';
  minPrice: string;
  maxPrice: string;
  language: string;
  sort: CourseSort;
};

type CourseFiltersProps = {
  categories: Category[];
  filters: CourseFilterState;
  onChange: (filters: CourseFilterState) => void;
};

export function CourseFilters({ categories, filters, onChange }: CourseFiltersProps) {
  const update = (key: keyof CourseFilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section
      aria-label="Course filters"
      className="soft-panel rounded-lg p-4"
    >
      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-brand-navy">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-50 text-brand-blue">
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
        </span>
        Refine courses
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label className="md:col-span-2">
          <span className="sr-only">Search courses</span>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <Input
              className="pl-9"
              onChange={(event) => update('search', event.target.value)}
              placeholder="Search courses..."
              value={filters.search}
            />
          </div>
        </label>
        <Select
          aria-label="Category"
          onChange={(event) => update('category', event.target.value)}
          value={filters.category}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Level"
          onChange={(event) => update('level', event.target.value)}
          value={filters.level}
        >
          <option value="">All levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="all-levels">All levels course</option>
        </Select>
        <Select
          aria-label="Free or paid"
          onChange={(event) => update('price', event.target.value)}
          value={filters.price}
        >
          <option value="">Free and paid</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </Select>
        <Input
          aria-label="Minimum price"
          inputMode="numeric"
          onChange={(event) => update('minPrice', event.target.value)}
          placeholder="Min XAF"
          value={filters.minPrice}
        />
        <Input
          aria-label="Maximum price"
          inputMode="numeric"
          onChange={(event) => update('maxPrice', event.target.value)}
          placeholder="Max XAF"
          value={filters.maxPrice}
        />
        <Input
          aria-label="Language"
          onChange={(event) => update('language', event.target.value)}
          placeholder="Language"
          value={filters.language}
        />
        <Select
          aria-label="Sort courses"
          onChange={(event) => update('sort', event.target.value)}
          value={filters.sort}
        >
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
          <option value="rating">Top rated</option>
          <option value="price-asc">Price low to high</option>
          <option value="price-desc">Price high to low</option>
          <option value="oldest">Oldest</option>
        </Select>
      </div>
    </section>
  );
}
