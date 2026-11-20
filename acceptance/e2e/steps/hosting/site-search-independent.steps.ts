import { expect } from '@playwright/test';
import { Given, Then } from '../../fixtures';
Given('独立交付站点已上线二十四个公开页面', async ({ independentDelivery }) => {
	expect(independentDelivery.site).toBeTruthy();
});
Then('完整分页、当前内容核验、跨代重搜与双进程撤权', async ({ request, independentDelivery }) => {
	const { get, mutation, base, site, attachmentPath, attachmentBytes } = independentDelivery;
	const attachment = await get(request, attachmentPath);
	expect(attachment.status()).toBe(200);
	// 内容资源带验证器并要求复用前重新验证（授权先于 304），不再是 no-store。
	expect(attachment.headers()['cache-control']).toMatch(/no-cache|no-store/);
	expect(attachment.headers()['etag']).toBeTruthy();
	expect((await attachment.body()).equals(attachmentBytes)).toBeTruthy();
	const first = await get(request, '/api/content/search?q=检索&limit=20');
	expect(first.headers()['cache-control']).toContain('no-store');
	const page = await first.json();
	expect(page.hits).toHaveLength(20);
	expect(page.nextCursor).toBeTruthy();
	const second = await get(
		request,
		`/api/content/search?q=检索&limit=20&cursor=${encodeURIComponent(page.nextCursor)}`
	);
	expect((await second.json()).hits).toHaveLength(4);
	await mutation(request, 'PATCH', `${base}/sites/${site}`, {
		branding: { primaryColor: '#125544' }
	});
	await expect
		.poll(async () =>
			(
				await get(
					request,
					`/api/content/search?q=检索&cursor=${encodeURIComponent(page.nextCursor)}`
				)
			).status()
		)
		.toBe(409);
	await mutation(request, 'DELETE', `${base}/sites/${site}/permissions/grants/anonymous`);
	const immediate = await get(request, '/docs/page-0');
	expect([403, 503]).toContain(immediate.status());
	await expect.poll(async () => (await get(request, '/docs/page-0')).status()).toBe(403);
	expect((await get(request, attachmentPath)).status()).toBe(403);
	const hidden = await get(request, '/api/content/search?q=检索');
	expect((await hidden.json()).hits).toHaveLength(0);
	await mutation(request, 'PUT', `${base}/sites/${site}/permissions/grants/anonymous`, {
		role: 'reader'
	});
	await expect.poll(async () => (await get(request, '/docs/page-0')).status()).toBe(200);
});

Then('即时搜索取消、IME、键盘、错误重试与品牌色', async ({ page, independentDelivery }) => {
	const { url } = independentDelivery;
	await page.goto(url('/docs/page-0'));
	// 空间切换：页眉的「可访问空间」导航，只列出有目录的空间。
	const spaces = page.getByRole('navigation', { name: '可访问空间' });
	await expect(spaces.getByRole('link')).toHaveCount(2);
	await expect(spaces.getByRole('link', { name: '阅读案例' })).toBeVisible();
	// 目录分组：侧边栏里的 <details>，折叠后子页面链接不可见。
	const sidebar = page.getByRole('complementary');
	const group = sidebar.locator('summary').filter({ hasText: '检索指南' }).first();
	await group.click();
	await expect(sidebar.getByRole('link', { name: '检索指南 0' })).toBeHidden();
	await group.click();
	await expect(sidebar.getByRole('link', { name: '检索指南 0' })).toBeVisible();
	// 即时搜索（ADR-0035：登录、搜索以岛屿实现）：目标 DOM 契约是页眉内的 combobox「搜索内容」
	// 与「搜索范围」。前端尚无此岛屿时本场景在此失败，作为前端缺口，不降低规格。
	const input = page.getByRole('combobox', { name: '搜索内容' });
	await expect(page.getByRole('combobox', { name: '搜索范围' })).toHaveValue('docs');
	await input.fill('检索');
	await expect(page.getByRole('listbox').getByRole('option').first()).toBeVisible();
	await input.press('ArrowDown');
	await expect(input).toHaveAttribute('aria-activedescendant', /site-search-option/);
	await input.press('Escape');
	await expect(input).toHaveAttribute('aria-expanded', 'false');
	let release!: () => void;
	const pending = new Promise<void>((resolve) => (release = resolve));
	await page.route('**/api/content/search?**', async (route) => {
		await pending;
		await route.fulfill({
			json: {
				query: '中文',
				hits: [
					{
						path: '/docs/page-0',
						title: '迟到结果',
						spaceName: '指南',
						snippet: '<mark>中文</mark>'
					}
				]
			}
		});
	});
	const sent = page.waitForRequest('**/api/content/search?**');
	await input.fill('中文');
	await sent;
	await input.fill('');
	release();
	await expect(input).toHaveAttribute('aria-expanded', 'false');
	await expect(page.getByText('迟到结果')).toHaveCount(0);
	await page.unrouteAll({ behavior: 'wait' });
	await input.dispatchEvent('compositionstart');
	await input.fill('中');
	await expect(input).toHaveAttribute('aria-expanded', 'false');
	await input.dispatchEvent('compositionend');
	await page.route('**/api/content/search?**', (route) =>
		route.fulfill({
			status: 503,
			contentType: 'application/problem+json',
			body: JSON.stringify({ code: 'delivery_unavailable', traceId: 'browser-trace' })
		})
	);
	await input.fill('配置');
	await expect(page.getByText(/browser-trace/).first()).toBeVisible();
	await expect(page.getByRole('option', { name: '重试搜索' })).toBeVisible();
	await page.unrouteAll({ behavior: 'wait' });
	await page.getByRole('option', { name: '重试搜索' }).click();
	await expect(page.getByRole('listbox').getByRole('option').first()).toContainText('检索指南');
	await page.goto(url('/_search?q=检索'));
	// 品牌色：以计算样式断言，不依赖 style 属性的序列化。
	expect(
		await page
			.locator('body')
			.evaluate((el) => getComputedStyle(el).getPropertyValue('--site-primary').trim())
	).toBe('#176b53');
	await page.setViewportSize({ width: 390, height: 844 });
	await expect(page.getByRole('button', { name: '搜索', exact: true })).toBeVisible();
	expect(
		await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
	).toBeTruthy();
	await page.screenshot({ path: '../.scratch/dw-v1/runtime/search-mobile.png', fullPage: true });
});

Then('真实禁用脚本的表单搜索及下一页', async ({ browser, independentDelivery }) => {
	const { url } = independentDelivery;
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto(url('/_search'));
	// 前端搜索页的输入框是 role=search 表单里的 searchbox「搜索词」，翻页链接是「更多结果」。
	await page.getByRole('searchbox', { name: '搜索词' }).fill('检索');
	await page.getByRole('button', { name: '搜索', exact: true }).click();
	await expect(page.getByRole('heading', { name: '搜索', exact: true, level: 1 })).toBeVisible();
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /(^|,)noindex(,|$)/);
	// 前端每页条数由 Reader 决定（当前 10 条），不在 URL 上暴露；沿「更多结果」走完，共 24 条，末页不再有链接。
	const results = page.getByRole('main').getByRole('listitem');
	const more = page.getByRole('link', { name: '更多结果' });
	await expect(results.first()).toBeVisible();
	let total = await results.count();
	let last = total;
	while (await more.isVisible()) {
		const before = page.url();
		await more.click();
		await page.waitForURL((next) => next.toString() !== before);
		await expect(results.first()).toBeVisible();
		last = await results.count();
		total += last;
	}
	expect(total).toBe(24);
	expect(last).toBeLessThan(24);
	await context.close();
});

Then(
	'发版回滚和挂载变化遵循线上版本，工作稿不可搜索',
	async ({ page, request, independentDelivery }) => {
		const { base, space, site, pageIds, get, mutation, originalReleaseId } = independentDelivery;
		const detail = await request.get(`${base}/spaces/${space}/pages/${pageIds[0]}`, {
			headers: { Authorization: `Bearer ${independentDelivery.token}` }
		});
		expect(detail.status()).toBe(200);
		await mutation(
			request,
			'PUT',
			`${base}/spaces/${space}/pages/${pageIds[0]}/content`,
			{ content: '检索新正文 uniquesourceneedle' },
			{ 'If-Match': detail.headers().etag }
		);
		expect(
			(await (await get(request, '/api/content/search?q=uniquesourceneedle')).json()).hits
		).toHaveLength(0);
		await mutation(request, 'POST', `${base}/spaces/${space}/releases:build`);
		await expect
			.poll(
				async () => {
					const r = await get(request, '/api/content/search?q=uniquesourceneedle');
					return r.status() === 200 ? (await r.json()).hits.length : 0;
				},
				{ timeout: 10000 }
			)
			.toBe(1);
		await mutation(request, 'PATCH', `${base}/sites/${site}`, {
			branding: { primaryColor: '#5a3aa1' }
		});
		await mutation(
			request,
			'POST',
			`${base}/spaces/${space}/releases/${originalReleaseId}:rollback`
		);
		await expect
			.poll(
				async () => (await (await get(request, '/docs/page-0')).text()).includes('检索正文 0'),
				{
					timeout: 10000
				}
			)
			.toBe(true);
		expect(
			(await (await get(request, '/api/content/search?q=uniquesourceneedle')).json()).hits
		).toHaveLength(0);
		await page.goto(independentDelivery.url('/_search?q=检索'));
		await expect
			.poll(() =>
				page
					.locator('body')
					.evaluate((el) => getComputedStyle(el).getPropertyValue('--site-primary').trim())
			)
			.toBe('#5a3aa1');
		await mutation(request, 'DELETE', `${base}/sites/${site}/mounts/docs`);
		await expect.poll(async () => (await get(request, '/docs/page-0')).status()).toBe(404);
		expect((await (await get(request, '/api/content/search?q=检索')).json()).hits).toHaveLength(0);
		await mutation(request, 'PUT', `${base}/sites/${site}/mounts/docs`, { spaceId: space });
		await expect
			.poll(
				async () => {
					const r = await get(request, '/api/content/search?q=检索&limit=20');
					return r.status() === 200 ? (await r.json()).hits.length : 0;
				},
				{ timeout: 10000 }
			)
			.toBe(20);
	}
);
