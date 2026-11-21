import { useState, type ReactNode } from 'react';
import { useResource, Resource } from './resource';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from './dialog';
import { Button } from './button';
import { Pagination } from './data-table';

/** Cursor state is local to the open detail dialog, independent of its parent list. */
export function PagedDialog<
  T extends { data: { nextCursor?: string | null } },
>({
  label,
  title = label,
  queryKey,
  load,
  children,
}: {
  label: string;
  title?: string;
  queryKey: readonly unknown[];
  load: (signal: AbortSignal, cursor?: string) => Promise<T>;
  children: (value: T) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const cursor = cursors.at(-1);
  const query = useResource(
    [...queryKey, cursor],
    (signal) => load(signal, cursor),
    open,
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>按服务器游标逐页读取记录。</DialogDescription>
        </DialogHeader>
        <Resource query={query}>
          {(value) => (
            <>
              {children(value)}
              <Pagination
                previous={() => setCursors((values) => values.slice(0, -1))}
                next={() => {
                  const next = value.data.nextCursor;
                  if (next) setCursors((values) => [...values, next]);
                }}
                hasPrevious={cursors.length > 1}
                hasNext={Boolean(value.data.nextCursor)}
              />
            </>
          )}
        </Resource>
      </DialogContent>
    </Dialog>
  );
}
