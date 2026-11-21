import { useId, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '@/shared/api/context';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Failure } from './feedback';

export type Choices = {
  items: { value: string; label: string }[];
  nextCursor?: string | null;
};
export function ChoiceField({
  name,
  label,
  kind,
  load,
  searchable = false,
  disabled = false,
}: {
  name: string;
  label: string;
  kind: string;
  searchable?: boolean;
  disabled?: boolean;
  load: (
    signal: AbortSignal,
    cursor: string | undefined,
    search: string,
  ) => Promise<Choices>;
}) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<Record<string, string>>();
  const selected = watch(name);
  const id = useId();
  const { scope, actorKey } = useServices();
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<(string | undefined)[]>([undefined]);
  const cursor = history.at(-1);
  const query = useQuery({
    queryKey: [actorKey, scope.tenantId, 'choices', kind, cursor, search],
    queryFn: ({ signal }) => load(signal, cursor, search),
    enabled: !disabled,
  });
  const options = query.data?.items ?? [];
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {searchable && (
        <Input
          aria-label={`${label}搜索`}
          placeholder="搜索"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setHistory([undefined]);
          }}
        />
      )}
      <select
        id={id}
        {...register(name, { required: '请选择资源' })}
        disabled={disabled || query.isPending}
        aria-invalid={Boolean(errors[name])}
        className="h-9 w-full rounded-md border bg-background px-2 text-sm"
      >
        <option value="">{query.isPending ? '正在加载…' : '选择资源'}</option>
        {selected && !options.some((item) => item.value === selected) && (
          <option value={selected}>{selected}</option>
        )}
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {query.isError && (
        <Failure
          error={query.error}
          retry={() => {
            void query.refetch();
          }}
        />
      )}
      {errors[name] && (
        <p className="text-xs text-destructive">{errors[name].message}</p>
      )}
      {(history.length > 1 || query.data?.nextCursor) && (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={history.length < 2}
            onClick={() => setHistory((old) => old.slice(0, -1))}
          >
            上一页选项
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={!query.data?.nextCursor}
            onClick={() => {
              const cursor = query.data?.nextCursor;
              if (cursor) setHistory((old) => [...old, cursor]);
            }}
          >
            下一页选项
          </Button>
        </div>
      )}
    </div>
  );
}
