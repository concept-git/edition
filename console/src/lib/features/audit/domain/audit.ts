export type AuditRecord = {
  id: string;
  time: string;
  actorName: string;
  action: string;
  outcome: string;
  targetType: string | null;
};

export type AuditFailure =
  | { kind: 'forbidden' }
  | { kind: 'rate_limited'; retryAfter: number | null }
  | { kind: 'unavailable'; traceId: string | null }
  | { kind: 'network' };

const actionLabels: Record<string, string> = {
  'Space.create': '创建空间',
  'Page.create': '创建页面'
};

export function actionLabel(action: string) {
  return actionLabels[action] ?? action;
}

export function outcomeLabel(outcome: string) {
  if (outcome === 'ok') return '成功';
  return outcome;
}

export function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(date);
}

export function canRetry(failure: AuditFailure) {
  return failure.kind === 'unavailable' || failure.kind === 'network';
}

export function failureMessage(failure: AuditFailure) {
  switch (failure.kind) {
    case 'forbidden':
      return '查询被拒绝。';
    case 'rate_limited':
      return failure.retryAfter === null ? '查询过于频繁，请稍后再试。' : `查询过于频繁，请在 ${failure.retryAfter} 秒后再试。`;
    case 'network':
      return '网络失败。查询没有完成。';
    case 'unavailable':
      return failure.traceId === null ? '查询没有完成。' : `查询没有完成。追踪号 ${failure.traceId}。`;
  }
}
