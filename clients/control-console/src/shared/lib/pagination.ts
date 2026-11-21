import { useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';

/** Cursor history belongs to the URL, so deep links, refresh and Back retain list context. */
export function usePagination(key = 'page') {
  const navigate = useNavigate();
  const search = useLocation({ select: (location) => location.search });
  const cursors = decode(search[key]);
  const update = (values: (string | null)[]) => {
    void navigate({
      to: '.',
      search: (previous) => ({
        ...previous,
        [key]: values.length > 1 ? JSON.stringify(values) : undefined,
      }),
    });
  };
  return {
    cursor: cursors.at(-1) ?? undefined,
    hasPrevious: cursors.length > 1,
    next: (cursor?: string | null) => {
      if (cursor) update([...cursors, cursor]);
    },
    previous: () => {
      if (cursors.length > 1) update(cursors.slice(0, -1));
    },
    reset: () => update([null]),
  };
}
function decode(value: unknown): (string | null)[] {
  if (typeof value !== 'string') return [null];
  try {
    const values: unknown = JSON.parse(value);
    return Array.isArray(values) &&
      values.length > 0 &&
      values.every((value) => typeof value === 'string' || value === null)
      ? values
      : [null];
  } catch {
    return [null];
  }
}
export function useFilter(
  key: string,
  fallback = '',
  pageKey = 'page',
): [string, (value: string) => void] {
  const navigate = useNavigate();
  const search = useLocation({ select: (location) => location.search });
  const value = typeof search[key] === 'string' ? search[key] : fallback;
  return [
    value,
    (next) => {
      void navigate({
        to: '.',
        replace: true,
        search: (previous) => ({
          ...previous,
          [key]: next || undefined,
          [pageKey]: undefined,
        }),
      });
    },
  ];
}

export function useLocalPagination() {
  const [history, setHistory] = useState<(string | undefined)[]>([undefined]);
  return {
    cursor: history.at(-1),
    hasPrevious: history.length > 1,
    next: (cursor?: string | null) => {
      if (cursor) setHistory((values) => [...values, cursor]);
    },
    previous: () =>
      setHistory((values) =>
        values.length > 1 ? values.slice(0, -1) : values,
      ),
    reset: () => setHistory([undefined]),
  };
}
