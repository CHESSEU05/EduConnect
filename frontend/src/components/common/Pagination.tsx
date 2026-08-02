import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { Pagination as PaginationData } from '../../types/api';
import { Button } from './Button';

type PaginationProps = {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
};

export function Pagination({ onPageChange, pagination }: PaginationProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      <Button
        aria-label="Previous page"
        disabled={!pagination.hasPreviousPage}
        onClick={() => onPageChange(pagination.page - 1)}
        variant="outline"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
      </Button>
      <span className="px-2 text-sm font-semibold text-text-secondary">
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <Button
        aria-label="Next page"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.page + 1)}
        variant="outline"
      >
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Button>
    </nav>
  );
}
