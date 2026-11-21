import { test, expect, type Page } from '@playwright/test';
import type { components } from '../../src/shared/api/generated/types';

const tenantId = '8ad68f2f-4fe2-42a9-812d-70470d00fb71';
const spaceId = '6bac10e7-c3af-4ea8-8b95-724e0e793828';
const pageId = '78153a1a-94ae-468a-a4ce-839b086325d3';
const base = `/api/v1/tenants/${tenantId}`;
const space: components['schemas']['SpaceDetail'] = {
  id: spaceId,
  tenantId,
  name: '产品指南',
  mode: 'authored',
  status: 'active',
  pageCount: 3,
  driftCount: 0,
  lastReleaseAt: null,
  createdAt: '2026-11-21T00:00:00Z',
  createdBy: null,
  updatedAt: '2026-11-21T00:00:00Z',
  updatedBy: null,
  collectionId: null,
  allowedActions: [
    'read',
    'update',
    'write_pages',
    'manage_permissions',
    'archive',
    'convert',
  ],
  icon: 'book',
  description: '产品维护与交付',
  collectionPath: [],
  mounts: [],
  retention: 7,
  autoRelease: false,
};
async function authenticated(page: Page) {
  await page.route('**/auth/refresh', (route) =>
    route.fulfill({
      json: { accessToken: 'browser-test-token', expiresIn: 600 },
    }),
  );
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      json: {
        id: '7078de99-757a-42f1-868b-b275c23f20c6',
        name: '维护者',
        email: 'editor@example.test',
        platformOperator: true,
        tenants: [
          {
            id: tenantId,
            name: 'Edition 团队',
            role: 'owner',
            status: 'active',
          },
        ],
      },
    }),
  );
  await page.route(`**${base}/spaces/${spaceId}`, (route) =>
    route.fulfill({ json: space }),
  );
}
test('a maintainer can enter a tenant and open its space', async ({ page }) => {
  await authenticated(page);
  await page.route(`**${base}/spaces?*`, (route) =>
    route.fulfill({
      json: {
        items: [space],
        nextCursor: null,
        total: 1,
        allowedActions: ['create'],
      },
    }),
  );
  await page.goto(`/console/t/${tenantId}/spaces`);
  await expect(
    page.getByRole('heading', { name: '空间', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: '产品指南', exact: true }),
  ).toHaveAttribute('href', `/console/t/${tenantId}/spaces/${spaceId}/pages`);
  await expect(page.getByRole('cell', { name: '站内创作' })).toBeVisible();
  await page.screenshot({
    path: test.info().outputPath('spaces-light.png'),
    fullPage: true,
  });
});
test('a rejected create keeps the input and trace before a successful explicit retry', async ({
  page,
}) => {
  await authenticated(page);
  let created = false;
  let attempts = 0;
  const keys: string[] = [];
  await page.route(`**${base}/spaces`, async (route) => {
    attempts++;
    keys.push(route.request().headers()['idempotency-key']);
    if (attempts === 1)
      await route.fulfill({
        status: 503,
        json: { code: 'dependency_unavailable', traceId: 'trace-create' },
      });
    else {
      created = true;
      await route.fulfill({ status: 201, json: { ...space, name: '新空间' } });
    }
  });
  await page.route(`**${base}/spaces?*`, (route) =>
    route.fulfill({
      json: {
        items: created ? [{ ...space, name: '新空间' }] : [],
        nextCursor: null,
        total: created ? 1 : 0,
        allowedActions: ['create'],
      },
    }),
  );
  await page.goto(`/console/t/${tenantId}/spaces`);
  await page.getByRole('button', { name: '创建空间', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('空间名称').fill('新空间');
  await dialog.getByRole('button', { name: '确认', exact: true }).click();
  await expect(dialog.getByText('追踪编号：trace-create')).toBeVisible();
  await expect(dialog.getByLabel('空间名称')).toHaveValue('新空间');
  await dialog.getByRole('button', { name: '确认', exact: true }).click();
  await expect(dialog.getByText('服务器已返回结果。')).toBeVisible();
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBeTruthy();
  expect(keys[0]).toBe(keys[1]);
  await dialog.getByRole('button', { name: '关闭', exact: true }).click();
  await expect(
    page.getByRole('link', { name: '新空间', exact: true }),
  ).toBeVisible();
});
test('Plate preserves the local draft on conflict and saves against an explicitly adopted baseline', async ({
  page,
}) => {
  await authenticated(page);
  let conflicted = false;
  let saves = 0;
  const received: { etag?: string; content?: string; intent?: string }[] = [];
  await page.route(`**${base}/spaces/${spaceId}/pages/${pageId}`, (route) =>
    route.fulfill({
      json: {
        id: pageId,
        title: '开始使用',
        format: 'markdown',
        allowedActions: ['edit', 'read', 'rename', 'publish'],
        status: 'draft',
      },
    }),
  );
  await page.route(
    `**${base}/spaces/${spaceId}/pages/${pageId}/content`,
    async (route) => {
      if (route.request().method() === 'GET')
        await route.fulfill({
          headers: { ETag: conflicted ? '"rev-2"' : '"rev-1"' },
          json: {
            id: pageId,
            format: 'markdown',
            content: conflicted ? 'their changes' : 'Original paragraph',
            revision: conflicted ? 2 : 1,
            contentType: 'markdown',
            versionRef: 'markdown:1',
            interpretation: {},
          },
        });
      else {
        saves++;
        received.push({
          etag: route.request().headers()['if-match'],
          ...route.request().postDataJSON(),
        });
        if (saves === 1) {
          conflicted = true;
          await route.fulfill({
            status: 409,
            json: { code: 'edit_conflict', traceId: 'conflict-test' },
          });
        } else
          await route.fulfill({
            json: { revision: 3 },
            headers: { ETag: '"rev-3"' },
          });
      }
    },
  );
  await page.goto(`/console/t/${tenantId}/spaces/${spaceId}/pages/${pageId}`);
  await page.getByRole('button', { name: '可视化编辑', exact: true }).click();
  const editor = page.getByLabel('页面正文');
  await expect(editor).toBeVisible();
  await editor.fill('my local draft');
  await page.getByRole('button', { name: '保存工作稿', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: '内容冲突：本地工作稿已保留' }),
  ).toBeVisible();
  await expect(editor).toContainText('my local draft');
  await expect(page.getByText('their changes', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '保留本地内容并采用新基线' }).click();
  await page.getByRole('button', { name: '保存工作稿', exact: true }).click();
  await expect(page.getByText('工作稿已保存', { exact: true })).toBeVisible();
  expect(received.map((item) => item.etag)).toEqual(['"rev-1"', '"rev-2"']);
  expect(received[1].content).toContain('my local draft');
  expect(received[1].intent).toBe('draft_only');
});
test('the shell supports a narrow viewport and a persistent dark theme', async ({
  page,
}) => {
  await authenticated(page);
  await page.route(`**${base}/spaces?*`, (route) =>
    route.fulfill({
      json: {
        items: [space],
        nextCursor: null,
        total: 1,
        allowedActions: ['create'],
      },
    }),
  );
  await page.goto(`/console/t/${tenantId}/spaces`);
  await page.getByLabel('主题', { exact: true }).selectOption('dark');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.setViewportSize({ width: 360, height: 780 });
  await expect(
    page.getByRole('heading', { name: '空间', exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: test.info().outputPath('spaces-mobile-dark.png'),
    fullPage: true,
  });
});

test('list filters and cursor pagination survive refresh and preserve the return context', async ({
  page,
}) => {
  await authenticated(page);
  await page.route(`**${base}/spaces?*`, (route) => {
    const url = new URL(route.request().url());
    const next = url.searchParams.get('cursor') === 'next-page';
    return route.fulfill({
      json: {
        items: [
          {
            ...space,
            name: next ? '下一页空间' : '已归档空间',
            status: 'archived',
          },
        ],
        nextCursor: next ? null : 'next-page',
        total: 2,
        allowedActions: ['create'],
      },
    });
  });
  await page.goto(`/console/t/${tenantId}/spaces?status=archived`);
  await expect(page.getByLabel('空间状态')).toHaveValue('archived');
  await expect(
    page.getByRole('link', { name: '已归档空间', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '下一页', exact: true }).click();
  await expect(
    page.getByRole('link', { name: '下一页空间', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('link', { name: '下一页空间', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('空间状态')).toHaveValue('archived');
  await page.getByRole('button', { name: '上一页', exact: true }).click();
  await expect(
    page.getByRole('link', { name: '已归档空间', exact: true }),
  ).toBeVisible();
});

test('editing a profile starts from current values and preserves optional fields', async ({
  page,
}) => {
  await authenticated(page);
  let body: unknown;
  await page.route('**/api/v1/me', async (route) => {
    const profile = {
      id: pageId,
      name: '维护者',
      email: 'editor@example.test',
      locale: 'zh-CN',
      avatar: 'https://example.test/avatar.png',
      tenants: [],
    };
    if (route.request().method() === 'PUT') {
      body = route.request().postDataJSON();
      await route.fulfill({ json: { ...profile, ...(body as object) } });
    } else await route.fulfill({ json: profile });
  });
  await page.route('**/api/v1/me/sessions{,?*}', (route) =>
    route.fulfill({ json: { sessions: [] } }),
  );
  await page.route('**/api/v1/me/access-tokens?*', (route) =>
    route.fulfill({ json: { items: [], nextCursor: null } }),
  );
  await page.route('**/api/v1/auth/context', (route) =>
    route.fulfill({ json: {} }),
  );
  await page.goto('/console/account');
  await page.getByRole('button', { name: '修改资料', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByLabel('姓名', { exact: true })).toHaveValue(
    '维护者',
  );
  await dialog.getByLabel('姓名', { exact: true }).fill('新的姓名');
  await dialog.getByRole('button', { name: '确认', exact: true }).click();
  await expect(dialog.getByText('服务器已返回结果。')).toBeVisible();
  expect(body).toEqual({
    name: '新的姓名',
    locale: 'zh-CN',
    avatar: 'https://example.test/avatar.png',
  });
});

test('HTML visual editing saves headings, emphasis, links and table cells as HTML', async ({
  page,
}) => {
  await authenticated(page);
  await page.route(`**${base}/spaces/${spaceId}/pages/${pageId}`, (route) =>
    route.fulfill({
      json: {
        id: pageId,
        title: 'HTML',
        format: 'html',
        status: 'draft',
        allowedActions: ['edit', 'read'],
      },
    }),
  );
  let saved = '';
  await page.route(
    `**${base}/spaces/${spaceId}/pages/${pageId}/content`,
    async (route) => {
      if (route.request().method() === 'GET')
        await route.fulfill({
          headers: { ETag: '"rev-1"' },
          json: {
            id: pageId,
            format: 'html',
            content:
              '<h2>Heading</h2><p><strong>Bold</strong> and <a href="https://example.test">Link</a></p><table><tbody><tr><td><p>Cell</p></td></tr></tbody></table><p>Last</p>',
            revision: 1,
            contentType: 'html',
            versionRef: null,
            interpretation: {},
          },
        });
      else {
        saved = route.request().postDataJSON().content;
        await route.fulfill({
          headers: { ETag: '"rev-2"' },
          json: { revision: 2 },
        });
      }
    },
  );
  await page.goto(`/console/t/${tenantId}/spaces/${spaceId}/pages/${pageId}`);
  await page.getByRole('button', { name: '可视化编辑', exact: true }).click();
  const editor = page.getByLabel('页面正文');
  await expect(editor).toContainText('Cell');
  await editor.click();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.type(' edited');
  await page.getByRole('button', { name: '保存工作稿', exact: true }).click();
  await expect(page.getByText('工作稿已保存', { exact: true })).toBeVisible();
  const result = await page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return {
      heading: doc.querySelector('h2')?.textContent,
      bold: doc.querySelector('strong')?.textContent,
      href: doc.querySelector('a')?.getAttribute('href'),
      cell: doc.querySelector('td')?.textContent,
      text: doc.body.textContent,
    };
  }, saved);
  expect(result).toMatchObject({
    heading: 'Heading',
    bold: 'Bold',
    href: 'https://example.test/',
  });
  expect(result.cell).toContain('Cell');
  expect(result.text).toContain('edited');
  await page.getByRole('button', { name: '源码编辑', exact: true }).click();
  await expect(page.getByLabel('源码正文')).toContainText('edited');
});
