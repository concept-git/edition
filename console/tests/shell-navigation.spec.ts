import { expect, test, type Page } from '@playwright/test';
import { signIn } from './sign-in';
import { resetStub } from './stub';

/**
 * Component and route check for the two shells.
 * Pages now require a session, so each check signs in through the local auth
 * stub first. The assertions are unchanged. This file does not boot Docker or
 * a real Control server.
 */

test.beforeEach(async ({ page }) => {
  const goto = page.goto.bind(page);
  page.goto = (url, options) => goto(url, { waitUntil: 'networkidle', ...options });
  await page.addInitScript(() => {
    const recorded: Array<{ duration: number; frames: string }> = [];
    (window as unknown as { __shellAnimations: Array<{ duration: number; frames: string }> }).__shellAnimations = recorded;
    const original = Element.prototype.animate;
    Element.prototype.animate = function (keyframes, options) {
      const duration = typeof options === 'number' ? options : (options?.duration ?? 0);
      recorded.push({ duration: Number(duration), frames: JSON.stringify(keyframes) });
      return original.call(this, keyframes, options);
    };
  });
  await resetStub();
  await signIn(page);
});

test('overview shell shows a wide sidebar and the content and site entries', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: '租户' });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link', { name: '当前租户', exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: '内容', exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: '站点', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '模块' })).toHaveCount(0);

  const box = await nav.boundingBox();
  expect(box?.width).toBeGreaterThan(200);
  expect(box?.width).toBeLessThan(260);
  const bar = await page.getByRole('banner').boundingBox();
  expect(bar?.height).toBeGreaterThan(48);
  expect(bar?.height).toBeLessThan(68);

  const canvas = await page.locator('[data-region="canvas"]').evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(canvas).toBe('rgb(243, 244, 248)');
  const selected = await nav.getByRole('link', { name: '当前租户', exact: true }).evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(selected).toBe('rgb(222, 246, 242)');
  await expect(page.getByRole('region', { name: '快速上手' })).toBeVisible();
});

test('content entry opens the icon rail, section menu, and three stat figures', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: '租户' }).getByRole('link', { name: '内容', exact: true }).click();
  await expect(page).toHaveURL('/content');

  const rail = page.getByRole('navigation', { name: '模块' });
  await expect(rail).toBeVisible();
  const railBox = await rail.boundingBox();
  expect(railBox?.width).toBeGreaterThan(52);
  expect(railBox?.width).toBeLessThan(80);
  await expect(page.getByRole('navigation', { name: '租户' })).toHaveCount(0);

  const section = page.getByRole('navigation', { name: '分区' });
  await expect(section.getByRole('link', { name: '使用情况', exact: true })).toBeVisible();
  await expect(section.getByRole('link', { name: '空间', exact: true })).toBeVisible();
  await expect(section.getByRole('link', { name: '分组', exact: true })).toBeVisible();

  const canvas = page.locator('[data-region="canvas"]');
  await expect(canvas).toHaveCSS('background-color', 'rgb(243, 244, 248)');
  await expect(canvas.locator('[data-sheet="page"]')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  const figures = canvas.getByRole('region', { name: '内容使用情况' }).locator('[data-figure]');
  await expect(figures).toHaveCount(3);
  await expect(canvas.getByText('成员', { exact: true })).toBeVisible();
  await expect(canvas.getByText('页面', { exact: true })).toBeVisible();
  await expect(canvas.getByText('已进版页面', { exact: true })).toBeVisible();
  const size = await figures.first().evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
  expect(size).toBeGreaterThanOrEqual(32);
});

test('every information architecture destination is reachable', async ({ page }) => {
  await page.goto('/');
  await openGroup(page, '成员关系');
  await openPlace(page, '租户', '成员', '/members', '成员');
  await page.goto('/');
  await openGroup(page, '成员关系');
  await openPlace(page, '租户', '用户组', '/teams', '用户组');

  await page.goto('/');
  await openGroup(page, '令牌');
  await openPlace(page, '租户', '机器令牌', '/integrations/api-tokens', '机器令牌');
  await page.goto('/');
  await openGroup(page, '令牌');
  await openPlace(page, '租户', '管理令牌', '/integrations/management-tokens', '管理令牌');

  await page.goto('/');
  await openGroup(page, '访问统计');
  await openPlace(page, '租户', '访问趋势', '/analytics/visits', '访问趋势');
  await page.goto('/');
  await openGroup(page, '访问统计');
  await openPlace(page, '租户', '搜索统计', '/analytics/search', '搜索统计');

  await page.goto('/');
  await openPlace(page, '租户', '审计日志', '/audit', '审计日志');

  for (const [groupItem, path, heading] of [
    ['密码', '/account/password', '密码'],
    ['会话', '/account/sessions', '会话'],
    ['停用', '/account/deactivate', '停用'],
    ['注销', '/account/erase', '注销']
  ] as const) {
    await page.goto('/');
    await openGroup(page, '用户');
    await page.getByRole('navigation', { name: '租户' }).getByRole('link', { name: groupItem, exact: true }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }

  for (const [groupItem, path, heading] of [
    ['内容类型', '/settings/content-types', '内容类型'],
    ['插件开发', '/settings/plugins', '插件开发']
  ] as const) {
    await page.goto('/');
    await openPlace(page, '租户', groupItem, path, heading);
  }

  await page.goto('/content');
  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '空间', exact: true }).click();
  await expect(page).toHaveURL('/content/spaces');
  await expect(page.getByRole('heading', { level: 1, name: '空间' })).toBeVisible();
  await page.goto('/content/spaces/example/pages');
  await expect(page.getByText('当前空间')).toBeVisible();
  await expect(page.getByRole('heading', { name: '示例空间' })).toBeVisible();

  for (const [label, path, heading] of [
    ['页面', '/content/spaces/example/pages', '页面'],
    ['目录', '/content/spaces/example/toc', '目录'],
    ['标签', '/content/spaces/example/tags', '标签'],
    ['发版', '/content/spaces/example/releases', '发版'],
    ['导入', '/content/spaces/example/imports', '导入'],
    ['授权', '/content/spaces/example/grants', '授权'],
    ['回收', '/content/spaces/example/trash', '回收']
  ] as const) {
    await page.getByRole('navigation', { name: '空间' }).getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole('heading', { level: 1, name: '示例空间' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    await expect(page.getByText('没有数据')).toBeVisible();
  }

  await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '分组', exact: true }).click();
  await expect(page).toHaveURL('/content/collections');
  await expect(page.getByRole('heading', { name: '分组' })).toBeVisible();
  await expect(page.getByText('没有数据')).toBeVisible();

  await page.getByRole('navigation', { name: '模块' }).getByRole('link', { name: '站点', exact: true }).click();
  await expect(page).toHaveURL('/sites');
  await expect(page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '站点' })).toBeVisible();
  await page.goto('/sites/example/mounts');
  await expect(page.getByText('当前站点')).toBeVisible();

  for (const [label, path, heading] of [
    ['挂载', '/sites/example/mounts', '挂载'],
    ['自有域名', '/sites/example/domains', '自有域名'],
    ['重定向', '/sites/example/redirects', '重定向'],
    ['搜索', '/sites/example/search', '搜索'],
    ['授权', '/sites/example/grants', '授权'],
    ['投递结果', '/sites/example/webhooks', '投递结果']
  ] as const) {
    await page.getByRole('navigation', { name: '站点' }).getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole('heading', { level: 1, name: '示例站点' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
    await expect(page.getByText('没有数据')).toBeVisible();
  }

  await page.getByRole('navigation', { name: '模块' }).getByRole('link', { name: '平台运营', exact: true }).click();
  for (const [label, path, heading] of [
    ['租户', '/platform/tenants', '租户'],
    ['用户', '/platform/users', '用户'],
    ['运行状态', '/platform/health', '运行状态'],
    ['邮件作业', '/platform/mail', '邮件作业']
  ] as const) {
    await page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: label, exact: true }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    await expect(page.getByText('没有数据')).toBeVisible();
    await expect(page.getByRole('navigation', { name: '模块' })).toBeVisible();
  }
});

test('the icon rail keeps the module shell until overview is chosen', async ({ page }) => {
  await page.goto('/content');
  await page.getByRole('navigation', { name: '模块' }).getByRole('link', { name: '访问统计', exact: true }).click();
  await expect(page).toHaveURL('/analytics/visits');
  await expect(page.getByRole('navigation', { name: '模块' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '分区' }).getByRole('link', { name: '搜索统计' })).toBeVisible();
  await page.getByRole('navigation', { name: '模块' }).getByRole('link', { name: '当前租户', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('navigation', { name: '租户' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '模块' })).toHaveCount(0);
});

test('keyboard focus is visible on the shell', async ({ page }) => {
  await page.goto('/');
  let sawOutline = false;
  for (let step = 0; step < 6; step += 1) {
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => {
      const element = document.activeElement;
      if (!element || element === document.body) return null;
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) };
    });
    if (outline && outline.style !== 'none' && outline.width >= 2) {
      sawOutline = true;
      break;
    }
  }
  expect(sawOutline).toBe(true);
});

test('the shell stays still when motion is allowed', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await clearAnimations(page);
  await page.getByRole('navigation', { name: '租户' }).getByRole('link', { name: '内容', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: '使用情况', exact: true })).toBeVisible();
  await settleMotion(page);
  const transform = await page.locator('[data-shell="module"]').evaluate((element) => getComputedStyle(element).transform);
  expect(transform).toBe('none');
  const recorded = await animations(page);
  expect(recorded.filter((item) => item.frames.includes('translate'))).toEqual([]);
});

test('reduced motion does not translate the shell', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await clearAnimations(page);
  await page.getByRole('navigation', { name: '租户' }).getByRole('link', { name: '内容', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: '使用情况', exact: true })).toBeVisible();
  await settleMotion(page);
  const transform = await page.locator('[data-shell="module"]').evaluate((element) => getComputedStyle(element).transform);
  expect(transform).toBe('none');
  const recorded = await animations(page);
  expect(recorded.filter((item) => item.duration > 0 && item.frames.includes('translate'))).toEqual([]);
});

test('shell copy stays on Edition words', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: '租户' }).getByRole('link', { name: '内容', exact: true }).click();
  const text = await page.locator('body').innerText();
  for (const word of ['WorkBuddy', '腾讯', '席位', 'Credit', '套餐', '协作文档']) {
    expect(text).not.toContain(word);
  }
});

async function animations(page: Page) {
  return page.evaluate(() => (window as unknown as { __shellAnimations: Array<{ duration: number; frames: string }> }).__shellAnimations);
}

async function settleMotion(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
}

async function clearAnimations(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { __shellAnimations: unknown[] }).__shellAnimations.length = 0;
  });
}

async function openGroup(page: Page, name: string) {
  const button = page.getByRole('navigation', { name: '租户' }).getByRole('button', { name, exact: true });
  if ((await button.getAttribute('aria-expanded')) !== 'true') await button.click();
}

async function openPlace(page: Page, navName: string, linkName: string, path: string, heading: string) {
  await page.getByRole('navigation', { name: navName }).getByRole('link', { name: linkName, exact: true }).click();
  await expect(page).toHaveURL(path);
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  await expect(page.getByText('没有数据')).toBeVisible();
}
