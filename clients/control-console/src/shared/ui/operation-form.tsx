import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Input } from './input';
import { Textarea } from './textarea';
import { Label } from './label';
import { Failure } from './feedback';
import { useServices } from '@/shared/api/context';
import { ApiFailure } from '@/shared/api/problem';
import { isRecord } from '@/shared/api/session';
import { Facts } from './facts';

export type Values = Record<string, string>;
export type IntentHeaders = { 'Idempotency-Key': string };
export function TextField({
  name,
  label,
  required = true,
  type = 'text',
  options,
  multiline,
  help,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  options?: readonly string[];
  multiline?: boolean;
  help?: string;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<Values>();
  const id = useId();
  const error = errors[name];
  const props = {
    ...register(name, { required: required ? '请填写此项' : false }),
    id,
    'aria-invalid': Boolean(error),
    'aria-describedby': error || help ? `${id}-help` : undefined,
  };
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label}
        {!required && (
          <span
            aria-hidden="true"
            className="font-normal text-muted-foreground"
          >
            （可选）
          </span>
        )}
      </Label>
      {options ? (
        <select
          {...props}
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
        >
          {!required && <option value="">保持不变</option>}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <Textarea {...props} rows={5} />
      ) : (
        <Input
          {...props}
          type={type}
          autoComplete={type === 'password' ? 'off' : undefined}
        />
      )}
      {(error || help) && (
        <p
          id={`${id}-help`}
          className={
            error ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'
          }
        >
          {error?.message ?? help}
        </p>
      )}
    </div>
  );
}

/** Only submission mechanics are shared; features own fields, data and business actions. */
export function Command({
  label,
  description,
  children,
  defaults = {},
  submit,
  success,
  danger = false,
  disabled = false,
  identity = '',
}: {
  label: string;
  description?: string;
  children?: ReactNode;
  defaults?: Values;
  submit: (
    values: Values,
    headers: IntentHeaders,
    signal: AbortSignal,
  ) => Promise<unknown>;
  success?: (result: unknown) => void;
  danger?: boolean;
  disabled?: boolean;
  identity?: string;
}) {
  const form = useForm<Values>({ defaultValues: defaults });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<unknown>();
  const [result, setResult] = useState<unknown>();
  const [completed, setCompleted] = useState(false);
  const intent = useRef<{ fingerprint: string; key: string } | null>(null);
  const active = useRef<AbortController | null>(null);
  const client = useQueryClient();
  const { actorKey, scope } = useServices();
  const close = () => {
    setOpen(false);
    setResult(undefined);
    setCompleted(false);
    if (completed) form.reset(defaults);
  };
  useEffect(
    () => () => {
      active.current?.abort();
    },
    [],
  );
  const run = form.handleSubmit(async (values) => {
    if (active.current) return;
    const fingerprint = JSON.stringify([identity, values]);
    if (intent.current?.fingerprint !== fingerprint)
      intent.current = { fingerprint, key: crypto.randomUUID() };
    const controller = new AbortController();
    active.current = controller;
    setError(undefined);
    try {
      const value = await submit(
        values,
        { 'Idempotency-Key': intent.current.key },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setResult(value);
      setCompleted(true);
      intent.current = null;
      void client.invalidateQueries({ queryKey: [actorKey, scope.tenantId] });
      success?.(value);
      toast.success(`${label}：服务器已响应`);
      if (value === undefined || value === null) close();
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(failure);
        if (failure instanceof ApiFailure)
          for (const violation of failure.violations)
            form.setError(violation.field, { message: violation.code });
      }
    } finally {
      if (active.current === controller) active.current = null;
    }
  });
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!form.formState.isSubmitting) {
          if (next) setOpen(true);
          else close();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={danger ? 'destructive' : 'outline'}
          size="sm"
          disabled={disabled}
        >
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            {description ??
              (danger
                ? '请确认操作对象和影响。执行结果以服务器返回为准。'
                : '提交后将按当前权限更新服务器记录。')}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={run} className="grid gap-4">
            <fieldset
              disabled={form.formState.isSubmitting || completed}
              className="grid min-w-0 gap-4"
            >
              {children}
              {danger && (
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" required className="mt-1" />
                  我已确认对象与操作影响
                </label>
              )}
            </fieldset>
            {error !== undefined && <Failure error={error} />}
            {completed && (
              <div
                role="status"
                className="rounded-md border bg-muted/50 p-3 text-sm"
              >
                服务器已返回结果。
                <Result value={result} />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={close}
                disabled={form.formState.isSubmitting}
              >
                关闭
              </Button>
              {!completed && (
                <Button
                  type="submit"
                  variant={danger ? 'destructive' : 'default'}
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? '正在提交…' : '确认'}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
export function Result({ value }: { value: unknown }) {
  if (value === undefined || value === null) return null;
  const data = isRecord(value) && 'data' in value ? value.data : value;
  return (
    <div className="mt-3 max-h-96 overflow-auto rounded-md border bg-background p-3">
      <Facts value={data} />
    </div>
  );
}
export function jsonField(value: string): unknown {
  return JSON.parse(value || '{}');
}
export const commaValues = (value = '') =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
