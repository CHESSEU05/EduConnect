import { useEffect, useState } from 'react';

import { getHealth, type HealthResponse } from '../api/health';
import type { AsyncDataStatus } from '../types/data-state';

type UseApiHealthResult = {
  data: HealthResponse | null;
  errorMessage: string | null;
  status: AsyncDataStatus;
};

export function useApiHealth(): UseApiHealthResult {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<AsyncDataStatus>('loading');

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setData(response);
        setStatus('success');
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setData(null);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'The API is currently unavailable.',
        );
        setStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    data,
    errorMessage,
    status,
  };
}
