import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const root = new URL('../', import.meta.url);
const contract = JSON.parse(
  await readFile(new URL('../../contracts/openapi.json', root), 'utf8'),
);
const usage = new Map();
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = new URL(
      entry.name + (entry.isDirectory() ? '/' : ''),
      directory,
    );
    if (entry.isDirectory()) {
      if (entry.name !== 'generated') await walk(file);
      continue;
    }
    if (!/\.tsx?$/.test(entry.name) || /\.test\./.test(entry.name)) continue;
    const text = await readFile(file, 'utf8');
    const ast = ts.createSourceFile(
      fileURLToPath(file),
      text,
      ts.ScriptTarget.Latest,
      true,
      entry.name.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    function visit(node) {
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.expression.getText(ast) === 'api'
      ) {
        const operation = node.expression.name.text;
        const source = fileURLToPath(file).slice(fileURLToPath(root).length);
        const line =
          ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
        if (!usage.has(operation)) usage.set(operation, []);
        usage.get(operation).push(`${source}:${line}`);
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
}
await walk(new URL('src/', root));
const special = {
  updateCurrentUser: {
    kind: 'alias',
    target: 'replaceCurrentUser',
    reason:
      '已弃用的 PATCH 兼容入口仍是完整替换语义；界面统一使用 PUT 并预填当前资料',
  },
  refreshSession: {
    kind: 'infrastructure',
    target: 'src/shared/api/session.ts',
    reason: '单一会话刷新协调器；会话生命周期测试覆盖',
  },
  remountSpace: {
    kind: 'alias',
    target: 'remountSpaceById',
    reason: '同一挂载操作的 slug 兼容入口，界面优先稳定 ID',
  },
  unmountSpace: {
    kind: 'alias',
    target: 'unmountSpaceById',
    reason: '同一卸载操作的 slug 兼容入口，界面优先稳定 ID',
  },
  reorderMounts: {
    kind: 'alias',
    target: 'reorderMountsBySpaceId',
    reason: '同一排序操作的 slug 兼容入口，界面优先稳定 ID',
  },
  previewRelease: {
    kind: 'alias',
    target: 'previewReleaseByPageId',
    reason: '同一页面预览的 slug 兼容入口，界面优先稳定 ID',
  },
  health: {
    kind: 'machine',
    target: 'infra/deployment/compose.yml',
    reason: '基础设施存活探针',
  },
  readiness: {
    kind: 'machine',
    target: 'infra/deployment/compose.yml',
    reason: '基础设施就绪探针',
  },
  keys: {
    kind: 'machine',
    target: 'JWKS clients',
    reason: '凭据验证公钥分发，控制台不生成操作页',
  },
  allowDomain: {
    kind: 'machine',
    target: 'Caddy on-demand TLS',
    reason: '域名准入回调',
  },
  ingestAnalytics: {
    kind: 'machine',
    target: 'infra/edition.ts collect',
    reason: '受密钥保护的内部统计采集',
  },
};
const records = Object.entries(contract.paths).flatMap(([path, methods]) =>
  Object.entries(methods)
    .filter(([method]) =>
      ['get', 'post', 'put', 'patch', 'delete'].includes(method),
    )
    .map(([method, operation]) => {
      const id = operation.operationId;
      const sources = usage.get(id);
      if (!sources && !special[id])
        throw new Error(`Unowned backend operation: ${id}`);
      const annotation = special[id];
      if (annotation?.kind === 'alias' && !usage.has(annotation.target))
        throw new Error(`Alias has no live canonical caller: ${id}`);
      return {
        id,
        method: method.toUpperCase(),
        path,
        kind: sources ? 'ui' : annotation.kind,
        sources: sources ?? [annotation.target],
        note: annotation?.reason ?? '已接线；接口引用不替代真实操作验收。',
        acceptance: '待真实验收',
      };
    }),
);
const markdown =
  '# 管理接口覆盖清单\n\n由 `pnpm check:coverage` 根据后台契约与实际 API 调用生成。接线与验收分开记录；本表不声明真实服务验收通过。\n\n| operation | 接口 | 去向 | 状态 |\n|---|---|---|---|\n' +
  records
    .map(
      (row) =>
        `| ${row.id} | ${row.method} \`${row.path}\` | ${row.sources.join('<br>')} — ${row.note} | ${row.acceptance} |`,
    )
    .join('\n') +
  '\n';
const target = new URL('API-COVERAGE.md', root);
if (process.argv.includes('--write')) await writeFile(target, markdown);
console.log(
  `Accounted for ${records.length} backend operations: ${records.filter((row) => row.kind === 'ui').length} UI, ${records.filter((row) => row.kind === 'alias').length} aliases, ${records.filter((row) => row.kind === 'machine').length} machine, 1 refresh coordinator.`,
);
