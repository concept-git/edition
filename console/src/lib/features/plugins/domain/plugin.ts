import type { ApiFailure } from '#lib/shared/api/client';

export const pluginEntryPoint = 'src/index.js';
export const pluginEnvironment = 'browser-es2022-v1';

export type PluginSource = {
  files: Record<string, string>;
  manifest: string;
  configuration: string;
  fixtures: string;
  dependencyLock: string;
  baselineRef: string;
};

export type Development = {
  id: string;
  name: string;
  contentType: string;
  revision: number;
  source: PluginSource;
  sourceDigest: string;
};

export type ContentTypeState = {
  contentType: string;
  enabled: boolean;
  activeVersionRef: string | null;
  label: string;
};

export type SavePluginRequest = {
  baseRevision: number;
  name: string;
  contentType: string;
  source: PluginSource;
};

export type CompilePluginRequest = {
  baseRevision: number;
  sourceDigest: string;
  entryPoint: string;
  bundle: string;
  environment: string;
};

/** One key per payload. A retry of that payload reuses it. */
export class IntentKey {
  private key: string | null = null;
  private fingerprint: string | null = null;

  take(fingerprint: string): string {
    if (this.key === null || this.fingerprint !== fingerprint) {
      this.key = crypto.randomUUID();
      this.fingerprint = fingerprint;
    }
    return this.key;
  }

  finish(): void {
    this.key = null;
    this.fingerprint = null;
  }
}

export function fileText(source: PluginSource): string {
  return source.files[pluginEntryPoint] ?? Object.values(source.files)[0] ?? '';
}

export function sourceWithFile(source: PluginSource, text: string): PluginSource {
  return { ...source, files: { ...source.files, [pluginEntryPoint]: text } };
}

export function pluginFailureMessage(failure: ApiFailure): string {
  if (failure.code === 'edit_conflict') return '基线冲突，本地源码还在。';
  if (failure.status === 429) {
    return failure.retryAfter === null ? '尝试过于频繁，请稍后再试。' : `尝试过于频繁，请在 ${failure.retryAfter} 秒后再试。`;
  }
  if (failure.status === 0) return '网络失败。本地源码仍保留。';
  if (failure.status >= 500) {
    return failure.traceId ? `服务没有完成。追踪号 ${failure.traceId}。本地源码仍保留。` : '服务没有完成。本地源码仍保留。';
  }
  return failure.traceId ? `没有完成。追踪号 ${failure.traceId}。本地源码仍保留。` : '没有完成。本地源码仍保留。';
}

export function queryFailureMessage(failure: ApiFailure): string {
  if (failure.status === 429) {
    return failure.retryAfter === null ? '尝试过于频繁，请稍后再试。' : `尝试过于频繁，请在 ${failure.retryAfter} 秒后再试。`;
  }
  if (failure.status === 0) return '网络失败。';
  return failure.traceId ? `查询没有完成。追踪号 ${failure.traceId}。` : '查询没有完成。';
}
