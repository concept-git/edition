import { useMemo, type ReactNode } from 'react';
import { useTable, type ColumnDef } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Button } from './button';
import { Empty } from './feedback';

export type DataColumn<T> = {
  id: string;
  title: string;
  render: (row: T) => ReactNode;
};
export function DataTable<T extends object>({
  rows,
  columns,
  rowId,
  caption,
  selected,
  onSelect,
}: {
  rows: T[];
  columns: DataColumn<T>[];
  rowId: (row: T) => string;
  caption?: string;
  selected?: string[];
  onSelect?: (selected: string[]) => void;
}) {
  const definitions = useMemo<ColumnDef<Record<never, never>, T>[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        header: column.title,
      })),
    [columns],
  );
  const table = useTable({
    features: {},
    data: rows,
    columns: definitions,
    getRowId: rowId,
  });
  if (!rows.length) return <Empty />;
  return (
    <div className="max-w-full overflow-x-auto rounded-lg border">
      <Table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {onSelect && (
                <TableHead>
                  <span className="sr-only">选择当前页记录</span>
                </TableHead>
              )}
              {group.headers.map((header) => (
                <TableHead key={header.id}>
                  <table.FlexRender header={header} />
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {onSelect && (
                <TableCell>
                  <input
                    type="checkbox"
                    aria-label={`选择 ${row.id}`}
                    checked={selected?.includes(row.id) ?? false}
                    onChange={(event) =>
                      onSelect(
                        event.target.checked
                          ? [...(selected ?? []), row.id]
                          : (selected?.filter((id) => id !== row.id) ?? []),
                      )
                    }
                  />
                </TableCell>
              )}
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="max-w-md whitespace-normal break-words align-top"
                >
                  {columns
                    .find((column) => column.id === cell.column.id)
                    ?.render(row.original)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
export function Pagination({
  next,
  previous,
  hasPrevious,
  hasNext,
}: {
  next: () => void;
  previous: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}) {
  return (
    <div className="mt-4 flex items-center justify-end gap-3 text-sm">
      <span className="mr-auto text-muted-foreground">每页 20 条</span>
      <Button
        variant="outline"
        size="sm"
        onClick={previous}
        disabled={!hasPrevious}
      >
        上一页
      </Button>
      <Button variant="outline" size="sm" onClick={next} disabled={!hasNext}>
        下一页
      </Button>
    </div>
  );
}

export function CursorPagination({
  pages,
  nextCursor,
}: {
  pages: {
    previous: () => void;
    next: (cursor?: string | null) => void;
    hasPrevious: boolean;
  };
  nextCursor?: string | null;
}) {
  return (
    <Pagination
      previous={pages.previous}
      next={() => pages.next(nextCursor)}
      hasPrevious={pages.hasPrevious}
      hasNext={Boolean(nextCursor)}
    />
  );
}
