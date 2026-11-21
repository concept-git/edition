import { AlertCircle, RotateCw, Inbox } from 'lucide-react';
import { Button } from './button';
import { ApiFailure, ContractFailure } from '@/shared/api/errors';
import { failureMessage } from '@/shared/api/problem';

export function Failure({
  error,
  retry,
}: {
  error: unknown;
  retry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
    >
      <div className="flex gap-2">
        <AlertCircle className="size-4 shrink-0 text-destructive" />
        <p>
          {error instanceof ContractFailure
            ? error.message
            : failureMessage(error)}
        </p>
      </div>
      {error instanceof ApiFailure && (
        <>
          {error.violations.length > 0 && (
            <ul className="mt-2 list-inside list-disc">
              {error.violations.map((v) => (
                <li key={`${v.field}:${v.code}`}>
                  {v.field}：{v.code}
                </li>
              ))}
            </ul>
          )}
          {error.traceId && (
            <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
              追踪编号：{error.traceId}
            </p>
          )}
          {error.retryAfter !== undefined && (
            <p className="mt-1">
              请等待至少 {Math.ceil(error.retryAfter / 1000)} 秒后重试。
            </p>
          )}
        </>
      )}
      {retry && (
        <Button variant="outline" size="sm" className="mt-3" onClick={retry}>
          <RotateCw />
          重试
        </Button>
      )}
    </div>
  );
}
export function Empty({
  title = '暂无记录',
  description = '此处会显示当前范围内的记录。',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
      <Inbox className="size-7 text-muted-foreground" />
      <h3 className="font-medium">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
export function Pending() {
  return (
    <div
      role="status"
      className="flex items-center gap-2 p-8 text-sm text-muted-foreground"
    >
      <RotateCw className="size-4 animate-spin motion-reduce:animate-none" />
      正在加载…
    </div>
  );
}
