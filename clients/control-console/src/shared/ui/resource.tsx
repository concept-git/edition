import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '@/shared/api/context';
import { Empty, Failure, Pending } from './feedback';

export function useResource<T>(
  key: readonly unknown[],
  request: (signal: AbortSignal) => Promise<T>,
  enabled = true,
) {
  const { actorKey, scope } = useServices();
  return useQuery({
    queryKey: [actorKey, scope.tenantId, ...key],
    queryFn: ({ signal }) => request(signal),
    enabled,
  });
}
export function Resource<T>({
  query,
  children,
}: {
  query: {
    isPending: boolean;
    isError: boolean;
    error: unknown;
    data?: T;
    refetch: () => unknown;
  };
  children: (data: T) => ReactNode;
}) {
  const failure = query.isError ? (
    <Failure
      error={query.error}
      retry={() => {
        void query.refetch();
      }}
    />
  ) : null;
  if (query.data === undefined) {
    if (query.isPending) return <Pending />;
    return failure ?? <Empty />;
  }
  // Keep the content subtree in the same position across background failures.
  return (
    <>
      {failure}
      {children(query.data)}
    </>
  );
}
export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </header>
  );
}
export function Section({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="mb-6 min-w-0 rounded-lg border bg-card p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
      {children}
    </section>
  );
}
