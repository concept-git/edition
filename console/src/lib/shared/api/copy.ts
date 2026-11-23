export function rateLimitText(action: string, retryAfter: number | null): string {
  return retryAfter === null ? `${action}过于频繁，请稍后再试。` : `${action}过于频繁，请在 ${retryAfter} 秒后再试。`;
}

export function traceText(prefix: string, traceId: string | null): string {
  return traceId ? `${prefix}追踪号 ${traceId}。` : prefix;
}

export function keyedText(lines: readonly string[]): { key: string; text: string }[] {
  const seen = new Map<string, number>();
  return lines.map((text) => {
    const count = (seen.get(text) ?? 0) + 1;
    seen.set(text, count);
    return { key: count === 1 ? text : `${text}#${count}`, text };
  });
}

export function keyedDiff<T extends { type: string; content: string }>(lines: readonly T[]): (T & { key: string })[] {
  const seen = new Map<string, number>();
  return lines.map((line) => {
    const text = `${line.type}:${line.content}`;
    const count = (seen.get(text) ?? 0) + 1;
    seen.set(text, count);
    return { ...line, key: count === 1 ? text : `${text}#${count}` };
  });
}
