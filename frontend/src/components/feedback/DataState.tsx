import type { ReactNode } from 'react';

import type { AsyncDataStatus } from '../../types/data-state';
import { EmptyState } from './EmptyState';
import { ErrorMessage } from './ErrorMessage';
import { LoadingState } from './LoadingState';

type DataStateProps = {
  children: ReactNode;
  emptyMessage?: string;
  emptyTitle?: string;
  errorMessage?: string;
  loadingLines?: number;
  loadingMessage?: string;
  loadingTitle?: string;
  status: AsyncDataStatus;
};

export function DataState({
  children,
  emptyMessage = 'There is no data to show yet.',
  emptyTitle = 'No data found',
  errorMessage = 'Something went wrong while loading this content.',
  loadingLines,
  loadingMessage,
  loadingTitle,
  status,
}: DataStateProps) {
  if (status === 'loading' || status === 'idle') {
    return (
      <LoadingState
        lines={loadingLines}
        message={loadingMessage}
        title={loadingTitle}
      />
    );
  }

  if (status === 'error') {
    return <ErrorMessage message={errorMessage} />;
  }

  if (status === 'empty') {
    return <EmptyState message={emptyMessage} title={emptyTitle} />;
  }

  return <>{children}</>;
}
