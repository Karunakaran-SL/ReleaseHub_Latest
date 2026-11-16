// SPDX-License-Identifier: AGPL-3.0-only
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SpecificationOptionDoc } from '@/lib/specification-options-defaults';

export interface UseSpecOptionsConfig {
  includeInactive?: boolean;
}

export function useSpecOptions(category: string, config?: UseSpecOptionsConfig) {
  const normalizedCategory = category.toUpperCase();
  const includeInactive = config?.includeInactive ?? false;

  const [options, setOptions] = useState<SpecificationOptionDoc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams({ category: normalizedCategory });
      if (includeInactive) {
        params.set('includeInactive', 'true');
      }
      const res = await fetch(`/api/settings/specifications/options?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const loaded: SpecificationOptionDoc[] = data.options || data.items || [];
      setOptions(loaded);
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err?.message || 'Failed to load options from database');
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
}, [normalizedCategory, includeInactive]);

useEffect(() => {
  fetchOptions();
}, [fetchOptions]);

return {
  options,
  isLoading,
  isError,
  errorMessage,
  refresh: fetchOptions,
};
}

export default useSpecOptions;
