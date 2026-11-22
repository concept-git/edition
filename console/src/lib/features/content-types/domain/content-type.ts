import type { ApiFailure } from '#lib/shared/api/client';

export type ContentTypeState = {
  contentType: string;
  enabled: boolean;
  revision: number;
  activeVersionRef: string;
  label: string;
  format: string;
  mediaType: string;
  builtin: boolean;
};

export type TypeList = {
  items: ContentTypeState[];
  canManage: boolean;
};

export type Contribution = {
  pluginId: string;
  pluginVersion: string;
  contributionId: string;
  config: Record<string, string>;
};

export type ContentTypeDefinition = {
  id: string;
  version: string;
  label: string;
  format: string;
  mediaType: string;
  language: string;
  renderHost: string;
  defaultInterpretation: Record<string, unknown>;
  validation: {
    encoding: string;
    schemaRef: string | null;
    instanceSchemaPointer: string | null;
  };
  schemaResources: Record<string, string>;
  editors: Contribution[];
  renderers: Contribution[];
};

export type ContentTypeVersion = {
  versionRef: string;
  digest: string;
  definition: ContentTypeDefinition;
  createdAt: string | null;
};

export type VersionSummary = {
  versionRef: string;
  contentType: string;
  version: string;
  digest: string;
  createdAt: string | null;
};

export type VersionList = {
  items: VersionSummary[];
};

export type PluginDescriptor = {
  id: string;
  name: string;
  version: string;
  trusted: boolean;
};

export type PluginCatalog = {
  items: PluginDescriptor[];
};

export type WriteIntent = {
  key: string;
  fingerprint: string;
};

type TrustedContribution = {
  pluginId: string;
  pluginVersion: string;
  contributionId: string;
  role: 'editor' | 'renderer';
  format: string;
  config: Record<string, string>;
};

/** Build-registered editor and renderer identities. The catalog must still mark the plugin trusted. */
const trustedContributions: TrustedContribution[] = [
  { pluginId: 'builtin.markdown', pluginVersion: '1.0.0', contributionId: 'source', role: 'editor', format: 'markdown', config: { language: 'markdown' } },
  { pluginId: 'builtin.markdown', pluginVersion: '1.0.0', contributionId: 'render', role: 'renderer', format: 'markdown', config: { codec: 'markdown' } },
  { pluginId: 'builtin.html', pluginVersion: '1.0.0', contributionId: 'source', role: 'editor', format: 'html', config: { language: 'html' } },
  { pluginId: 'builtin.html', pluginVersion: '1.0.0', contributionId: 'render', role: 'renderer', format: 'html', config: { codec: 'html' } },
  { pluginId: 'builtin.txt', pluginVersion: '1.0.0', contributionId: 'source', role: 'editor', format: 'txt', config: { language: 'plain' } },
  { pluginId: 'builtin.txt', pluginVersion: '1.0.0', contributionId: 'render', role: 'renderer', format: 'txt', config: { language: 'plain' } },
  { pluginId: 'builtin.json', pluginVersion: '1.0.0', contributionId: 'source', role: 'editor', format: 'json', config: { language: 'json' } },
  { pluginId: 'builtin.json', pluginVersion: '1.0.0', contributionId: 'render', role: 'renderer', format: 'json', config: { language: 'json' } },
  { pluginId: 'builtin.xml', pluginVersion: '1.0.0', contributionId: 'source', role: 'editor', format: 'xml', config: { language: 'xml' } },
  { pluginId: 'builtin.xml', pluginVersion: '1.0.0', contributionId: 'render', role: 'renderer', format: 'xml', config: { language: 'xml' } }
];

export const formatOptions = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'txt', label: 'TXT' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' }
];

export const renderHostOptions = [
  { value: 'server', label: '服务器' },
  { value: 'browser', label: '浏览器' }
];

export function sameIntent(current: WriteIntent | null, fingerprint: string): WriteIntent {
  if (current !== null && current.fingerprint === fingerprint) return current;
  return { key: crypto.randomUUID(), fingerprint };
}

export function retrySameIntent(status: number): boolean {
  return status === 0 || status >= 500;
}

export function baselineFor(types: ContentTypeState[], contentType: string): number {
  return types.find((item) => item.contentType === contentType)?.revision ?? 0;
}

export function parseInterpretation(text: string): { ok: true; value: Record<string, unknown> } | { ok: false } {
  const trimmed = text.trim();
  if (trimmed.length === 0) return { ok: true, value: {} };
  try {
    const value = JSON.parse(trimmed) as unknown;
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return { ok: false };
    return { ok: true, value: value as Record<string, unknown> };
  } catch {
    return { ok: false };
  }
}

export function definitionText(definition: ContentTypeDefinition): string {
  return JSON.stringify(definition, null, 2);
}

export function buildDefinition(
  catalog: PluginDescriptor[],
  input: {
    contentType: string;
    version: string;
    label: string;
    format: string;
    mediaType: string;
    language: string;
    renderHost: string;
    interpretation: string;
  }
): { ok: true; definition: ContentTypeDefinition } | { ok: false; message: string } {
  const parsed = parseInterpretation(input.interpretation);
  if (!parsed.ok) return { ok: false, message: '默认解释需要是 JSON 对象。' };
  const editor = trustedFor(catalog, input.format, 'editor');
  const renderer = trustedFor(catalog, input.format, 'renderer');
  if (!editor || !renderer) return { ok: false, message: '没有可信的编辑或呈现。' };
  return {
    ok: true,
    definition: {
      id: input.contentType.trim(),
      version: input.version.trim(),
      label: input.label.trim(),
      format: input.format,
      mediaType: input.mediaType.trim(),
      language: input.language.trim(),
      renderHost: input.renderHost,
      defaultInterpretation: parsed.value,
      validation: validationFor(input.format),
      schemaResources: {},
      editors: [toContribution(editor)],
      renderers: [toContribution(renderer)]
    }
  };
}

export function contentTypeFailure(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败。页面上的内容仍保留。';
  if (failure.status === 429) {
    return failure.retryAfter === null ? '尝试过于频繁，请稍后再试。' : `尝试过于频繁，请在 ${failure.retryAfter} 秒后再试。`;
  }
  switch (failure.code) {
    case 'edit_conflict':
      return '基线已变化。请按当前修订重试。';
    case 'version_exists':
      return '这个版本已经登记。';
    case 'invalid_idempotency_key':
      return '缺少幂等键。';
    case 'idempotency_key_reused':
      return '这个幂等键已经用于另一份请求。';
    case 'content_type_disabled':
      return '这个内容类型已停用。';
    default:
      return failure.traceId ? `没有完成。追踪号 ${failure.traceId}。` : '没有完成。';
  }
}

export function readFailure(failure: ApiFailure, subject: string): string {
  if (failure.status === 0) return `网络失败，${subject}没有载入。`;
  if (failure.status === 429) {
    return failure.retryAfter === null ? `${subject}没有载入。请稍后再试。` : `${subject}没有载入。请在 ${failure.retryAfter} 秒后再试。`;
  }
  return failure.traceId ? `${subject}没有载入。追踪号 ${failure.traceId}。` : `${subject}没有载入。`;
}

function trustedFor(catalog: PluginDescriptor[], format: string, role: 'editor' | 'renderer') {
  return (
    trustedContributions.find(
      (item) =>
        item.format === format &&
        item.role === role &&
        catalog.some((plugin) => plugin.trusted && plugin.id === item.pluginId && plugin.version === item.pluginVersion)
    ) ?? null
  );
}

function toContribution(item: TrustedContribution): Contribution {
  return {
    pluginId: item.pluginId,
    pluginVersion: item.pluginVersion,
    contributionId: item.contributionId,
    config: { ...item.config }
  };
}

function validationFor(format: string) {
  if (format === 'json') return { encoding: 'json', schemaRef: null, instanceSchemaPointer: '/interpretation/schema' };
  return { encoding: 'text', schemaRef: null, instanceSchemaPointer: null };
}
