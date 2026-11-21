import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { acceptancePassword, apiLogin, createVerifiedUser, unique } from './support/accounts';
import { backendOrigin } from './support/environment';
import { markPlatformOperator } from './support/ops-sql';

const consoleOrigin = process.env.E2E_CONSOLE_ORIGIN ?? 'https://console.acme.test:8446';
let email: string; let token: string; let tenantId: string;
test.beforeEach(async ({ page }) => { page.setDefaultTimeout(15000); page.on('pageerror', (error) => console.error('Console page error:', error.message)); page.on('console', (message) => { if (message.type() === 'error') console.error('Console runtime:', message.text()); }); });
async function api(request: APIRequestContext, method: string, path: string, data?: unknown, headers: Record<string, string> = {}) {
  const response = await request.fetch(backendOrigin + path, { method, data, headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': crypto.randomUUID(), ...headers } });
  expect(response.ok(), `${method} ${path}: ${response.status()} ${await response.text()}`).toBeTruthy();
  return { data: response.status() === 204 ? undefined : await response.json(), response };
}
async function signIn(page: Page, path = '') {
  await page.goto(`${consoleOrigin}/console/${path}`);
  await page.getByLabel('邮箱', { exact: true }).fill(email); await page.getByLabel('密码', { exact: true }).fill(acceptancePassword); await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByRole('button', { name: '退出登录', exact: true })).toBeVisible();
}
async function submit(page: Page, label: string, fields: Record<string, string> = {}, danger = false) {
  await page.getByRole('button', { name: label, exact: true }).click(); const dialog = page.getByRole('dialog');
  for (const [name, value] of Object.entries(fields)) { const input = dialog.getByRole('textbox', { name, exact: true }).or(dialog.getByRole('combobox', { name, exact: true })).or(dialog.getByRole('spinbutton', { name, exact: true })); if (await input.evaluate((element) => element.tagName === 'SELECT')) await input.selectOption(value); else await input.fill(value); }
  if (danger) await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: '确认', exact: true }).click();
  await expect(page.getByText(`${label}：服务器已响应`, { exact: true })).toBeVisible();
  if (await dialog.isVisible()) await dialog.getByRole('button', { name: '关闭', exact: true }).click();
}
test.beforeAll(async ({ request }) => {
  email = await createVerifiedUser(request, 'react-console'); await markPlatformOperator(email); token = await apiLogin(request, email);
  const result = await api(request, 'POST', '/admin/tenants', { name: unique('React控制台验收'), ownerEmail: email }); tenantId = result.data.tenant.id;
});
test('console login, space creation and refresh use the real same-origin session', async ({ page }) => {
  await signIn(page, `t/${tenantId}/spaces`);
  const name = unique('浏览器空间'); await submit(page, '创建空间', { 空间名称: name });
  await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: '登录控制台' })).toHaveCount(0);
});
test('Plate saves Markdown and preserves input when another writer changes the baseline', async ({ page, request }) => {
  const base = `/api/v1/tenants/${tenantId}`;
  const space = (await api(request, 'POST', `${base}/spaces`, { name: unique('并发编辑'), mode: 'authored' })).data;
  await api(request, 'PATCH', `${base}/spaces/${space.id}`, { autoRelease: false });
  const entry = (await api(request, 'POST', `${base}/spaces/${space.id}/pages`, { title: '并发编辑验收', slug: 'concurrency', format: 'markdown' })).data;
  const path = `${base}/spaces/${space.id}/pages/${entry.id}/content`;
  await signIn(page, `t/${tenantId}/spaces/${space.id}/pages/${entry.id}`);
  await page.getByRole('button', { name: '可视化编辑', exact: true }).click();
  const editor = page.getByLabel('页面正文'); await editor.fill('本地保留的工作稿');
  const baseline = await api(request, 'GET', path);
  await api(request, 'PUT', path, { content: '另一个作者的内容', intent: 'draft_only' }, { 'If-Match': baseline.response.headers().etag });
  await page.getByRole('button', { name: '保存工作稿', exact: true }).click();
  await expect(page.getByRole('heading', { name: '内容冲突：本地工作稿已保留' })).toBeVisible(); await expect(editor).toContainText('本地保留的工作稿');
  await page.getByRole('button', { name: '保留本地内容并采用新基线' }).click(); await page.getByRole('button', { name: '保存工作稿', exact: true }).click();
  await expect(page.getByText('工作稿已保存', { exact: true })).toBeVisible();
  const saved = await api(request, 'GET', path); expect(saved.data.content).toContain('本地保留的工作稿'); expect(saved.data.revision).toBe(2);
});
test('real feature routes render backend results without hiding failures as empty data', async ({ page }) => {
  await signIn(page, `t/${tenantId}/spaces`);
  const routes = [ ['collections', '空间分组'], ['tags', '标签'], ['sites', '站点'], ['domains', '域名'], ['releases', '全部发版'], ['members', '租户成员与邀请'], ['teams', '用户组'], ['tokens', 'API 令牌'], ['audit', '审计'], ['webhooks', 'Webhook'], ['stats', '统计与使用量'], ['deletions', '资源清理'], ['content-types', '内容类型'], ['plugins', '插件开发'] ];
  for (const [route, heading] of routes) {
    await page.goto(`${consoleOrigin}/console/t/${tenantId}/${route}`);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: '正在加载' })).toHaveCount(0);
    await expect(page.getByRole('alert')).toHaveCount(0);
  }
  for (const [route, heading] of [['tenants', '平台租户'], ['users', '平台用户'], ['operations', '运行诊断']]) {
    await page.goto(`${consoleOrigin}/console/platform/${route}`); await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible(); await expect(page.getByRole('alert')).toHaveCount(0);
  }
});

test('page metadata, attachments, recycling and restoration persist through the real APIs', async ({ page, request }) => {
  test.setTimeout(120000);
  const base = `/api/v1/tenants/${tenantId}`;
  const space = (await api(request, 'POST', `${base}/spaces`, { name: unique('内容维护'), mode: 'authored' })).data;
  await api(request, 'PATCH', `${base}/spaces/${space.id}`, { autoRelease: false });
  await signIn(page, `t/${tenantId}/spaces/${space.id}/pages`);
  await submit(page, '创建页面', { 标题: '生命周期页面', 页面相对路径: 'lifecycle' });
  await page.getByRole('link', { name: '生命周期页面', exact: true }).click();
  const entries = (await api(request, 'GET', `${base}/spaces/${space.id}/pages`)).data.items; const entry = entries.find((value: { slug: string }) => value.slug === 'lifecycle');
  await page.getByRole('tab', { name: '信息与进版', exact: true }).click();
  await submit(page, '修改标题', { 标题: '已修改标题' });
  await submit(page, '修改 SEO', { 'SEO 标题': '浏览器 SEO', 摘要: '来自控制台的摘要' });
  await submit(page, '设置属性', { 属性名: 'audience', 属性值: 'maintainers' });
  await submit(page, '添加标签', { 标签: '浏览器验收' });
  const detail = (await api(request, 'GET', `${base}/spaces/${space.id}/pages/${entry.id}`)).data;
  expect(detail.title).toBe('已修改标题'); expect(detail.seo.title).toBe('浏览器 SEO'); expect(detail.properties.audience).toBe('maintainers'); expect(detail.tags).toContain('浏览器验收');
  await page.goto(`${consoleOrigin}/console/t/${tenantId}/spaces/${space.id}/attachments`);
  await page.getByRole('button', { name: '上传页面附件', exact: true }).click(); let dialog = page.getByRole('dialog');
  await dialog.getByLabel('所属页面', { exact: true }).selectOption(entry.id);
  await dialog.getByLabel('选择文件', { exact: true }).setInputFiles({ name: 'guide.txt', mimeType: 'text/plain', buffer: Buffer.from('console attachment') });
  await dialog.getByRole('button', { name: '确认', exact: true }).click(); await expect(dialog.getByRole('alert')).toContainText('file_type_unsupported');
  await dialog.getByLabel('选择文件', { exact: true }).setInputFiles({ name: 'guide.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=', 'base64') });
  await dialog.getByRole('button', { name: '确认', exact: true }).click(); await expect(dialog.getByText('服务器已返回结果。')).toBeVisible(); await dialog.getByRole('button', { name: '关闭', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'guide.png', exact: true })).toBeVisible();
  const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: '下载', exact: true }).click(); dialog = page.getByRole('dialog'); await dialog.getByRole('button', { name: '确认', exact: true }).click(); expect((await downloaded).suggestedFilename()).toBe('guide.png');
  await expect(dialog).toHaveCount(0); await submit(page, '移除', {}, true); await expect(page.getByRole('cell', { name: 'guide.png', exact: true })).toHaveCount(0);
  await page.goto(`${consoleOrigin}/console/t/${tenantId}/spaces/${space.id}/pages/${entry.id}`); await page.getByRole('tab', { name: '信息与进版', exact: true }).click(); await submit(page, '回收页面', {}, true);
  await page.goto(`${consoleOrigin}/console/t/${tenantId}/spaces/${space.id}/trash`); await expect(page.getByRole('link', { name: '已修改标题', exact: true })).toBeVisible(); await submit(page, '还原页面');
  await page.goto(`${consoleOrigin}/console/t/${tenantId}/spaces/${space.id}/pages`); await expect(page.getByRole('link', { name: '已修改标题', exact: true })).toBeVisible();
});

test('site mounts and team settings use selected backend resources and stable identifiers', async ({ page, request }) => {
  test.setTimeout(90000); const base = `/api/v1/tenants/${tenantId}`;
  const space = (await api(request, 'POST', `${base}/spaces`, { name: unique('挂载来源'), mode: 'authored' })).data;
  await signIn(page, `t/${tenantId}/sites`); const name = unique('控制台站点'); await submit(page, '创建站点', { 站点名称: name }); await page.getByRole('link', { name, exact: true }).click();
  await submit(page, '挂载空间', { 空间: space.id, 站点内空间路径: 'guide' }); await expect(page.getByRole('cell', { name: 'guide', exact: true })).toBeVisible();
  await submit(page, '修改挂载路径', { 新路径: 'manual' }); await expect(page.getByRole('cell', { name: 'manual', exact: true })).toBeVisible();
  await submit(page, '卸载空间', {}, true); await expect(page.getByRole('cell', { name: 'manual', exact: true })).toHaveCount(0);
  await page.goto(`${consoleOrigin}/console/t/${tenantId}/teams`); const teamName = unique('控制台用户组'); await submit(page, '创建用户组', { 名称: teamName }); await page.getByRole('link', { name: teamName, exact: true }).click(); await submit(page, '重命名用户组', { 新名称: `${teamName}-更新` });
  await page.goto(`${consoleOrigin}/console/t/${tenantId}/teams`); await expect(page.getByRole('link', { name: `${teamName}-更新`, exact: true })).toBeVisible();
});

test('a browser compiled plugin candidate runs in isolation and records independent server verification', async ({ page }) => {
  test.setTimeout(120000); await signIn(page, `t/${tenantId}/plugins`); const name = unique('浏览器插件');
  await submit(page, '创建开发稿', { 名称: name }); await page.getByRole('link', { name, exact: true }).click();
  await submit(page, '编译固定候选'); await expect(page.getByText('浏览器运行已结束', { exact: true })).toBeVisible();
  await expect(page.frameLocator('iframe[title="插件候选隔离运行"]').getByText('Hello Edition', { exact: true })).toBeVisible();
  const response = page.waitForResponse((response) => response.request().method() === 'POST' && response.url().includes('/plugin-verifications'));
  await submit(page, '提交证据并执行服务端校验'); const result = await (await response).json(); expect(result.browserEvidence.passed).toBe(true); expect(result.serverValidation.passed).toBe(true); expect(result.productionEligible).toBe(false);
  await expect(page.getByRole('cell', { name: result.id, exact: true })).toBeVisible();
});
