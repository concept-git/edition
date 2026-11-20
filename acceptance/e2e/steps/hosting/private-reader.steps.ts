import { runRuntimeCommand } from '../../support/runtime-command';
import { expect, type APIRequestContext, type Page } from '@playwright/test';
import { prepareIndependentDelivery } from '../../support/delivery/prepare';
import { createVerifiedUser, apiLogin, acceptancePassword } from '../../support/accounts';
import { Then, Given } from '../../fixtures';
import { backendOrigin, readerOrigin } from '../../support/environment';
import { seedDnsTxt } from '../../support/ops-sql';

const ingressPort = process.env.E2E_INGRESS_PORT ?? '8446';
/** 会话续期的可见请求：脚本与无脚本表单都直接到 Control 的 /_auth/session/refresh（刷新 Cookie 只发往 /_auth）。 */
const refreshUrl = /\/_auth\/session\/refresh(?:[?#]|$)/;
const container = (role: 'source' | 'search') =>
	`${process.env.SPACE_COMPOSE_PROJECT ?? 'dw-remaining'}-${role}-1`;

/** 在页面内（站点源）取字节：站点域名只有浏览器能解析。 */
async function fetchBytes(page: Page, url: string) {
	const result = await page.evaluate(async (target) => {
		const response = await fetch(target);
		return {
			status: response.status,
			bytes: Array.from(new Uint8Array(await response.arrayBuffer()))
		};
	}, url);
	return { status: result.status, bytes: Buffer.from(result.bytes) };
}

/** 在页面内提交表单 POST（同站点 Origin 与 Cookie 由浏览器带上），返回最终状态码。 */
async function postForm(page: Page, url: string, fields: Record<string, string>) {
	return page.evaluate(
		async ({ target, body }) =>
			(
				await fetch(target, {
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: new URLSearchParams(body)
				})
			).status,
		{ target: url, body: fields }
	);
}

async function prepare(request: APIRequestContext) {
	const world = await prepareIndependentDelivery(request);
	const email = await createVerifiedUser(request, 'private-reader');
	const token = await apiLogin(request, email);
	const identity = await (
		await request.get(`${backendOrigin}/api/v1/me`, {
			headers: { Authorization: `Bearer ${token}` }
		})
	).json();
	const invitation = await world.mutation(request, 'POST', `${world.base}/invitations`, {
		email,
		role: 'member'
	});
	const accepted = await request.post(
		`${backendOrigin}/api/v1/invitations/${invitation.token}:accept`,
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	expect(accepted.status(), await accepted.text()).toBe(200);
	await world.mutation(
		request,
		'PUT',
		`${world.base}/sites/${world.site}/permissions/grants/user:${identity.id}`,
		{ role: 'reader' }
	);
	for (let i = 1; i < 3; i++)
		await world.mutation(request, 'POST', `${world.base}/spaces/${world.space}/toc/entries`, {
			label: `检索指南 ${i}`,
			kind: 'target',
			targetId: world.pageIds[i]
		});
	await world.mutation(request, 'POST', `${world.base}/spaces/${world.space}/releases:build`);
	await world.mutation(
		request,
		'DELETE',
		`${world.base}/sites/${world.site}/permissions/grants/anonymous`
	);
	await expect
		.poll(async () => (await world.get(request, '/docs/page-0')).status(), { timeout: 15000 })
		.toBe(403);
	return {
		...world,
		email,
		readerId: identity.id as string,
		readerToken: token,
		url: (path: string) => `https://${world.host}:${ingressPort}${path}`
	};
}
type World = Awaited<ReturnType<typeof prepare>>;
async function signIn(page: Page, world: World) {
	await page.goto(world.url('/_login?returnTo=%2Fdocs%2Fpage-0'));
	await page.getByLabel('邮箱').fill(world.email);
	await page.getByLabel('密码', { exact: true }).fill(acceptancePassword);
	// 登录表单是前端 /_login 的表单：无脚本时 POST /_login，有脚本时脚本改调 /_auth/session。
	await page.getByRole('button', { name: '登录', exact: true }).click();
	await expect(page).toHaveURL(world.url('/docs/page-0'));
	await expect(page.locator('article')).toContainText('检索正文 0');
}

Then('无脚本私有正文、目录、前后篇、搜索、附件及匿名 sitemap', async ({ browser, request }) => {
	const world = await prepare(request);
	const context = await browser.newContext({ javaScriptEnabled: false, ignoreHTTPSErrors: true });
	const page = await context.newPage();
	await signIn(page, world);
	await expect(
		page
			.getByRole('complementary')
			.getByRole('link', { name: /检索指南 1/ })
			.first()
	).toBeVisible();
	await page.goto(world.url('/_search?q=检索'));
	// 每页条数由 Reader 决定；沿「更多结果」走完应共 24 条且末页没有后续链接。
	const results = page.getByRole('main').getByRole('listitem');
	const more = page.getByRole('link', { name: '更多结果' });
	await expect(results.first()).toBeVisible();
	let total = await results.count();
	while (await more.isVisible()) {
		const before = page.url();
		await more.click();
		await page.waitForURL((next) => next.toString() !== before);
		await expect(results.first()).toBeVisible();
		total += await results.count();
	}
	expect(total).toBe(24);
	// 附件以下载形式交付（页面导航会变成下载），用同一浏览器上下文的请求取字节，Cookie 相同。
	// 站点域名只有浏览器能解析（host-resolver-rules），所以在页面内取字节。
	const download = await fetchBytes(page, world.url(world.attachmentPath));
	expect(download.status).toBe(200);
	expect(download.bytes.equals(world.attachmentBytes)).toBeTruthy();
	const sitemap = await page.goto(world.url('/sitemap.xml'));
	expect(await sitemap!.text()).not.toContain('/docs/page-0');
	// 退出：前端的 POST /_logout 表单路由（同站点 Origin），由它代调 Control 并带回清除 Cookie。
	// 前端目前没有「退出」控件，只能直接提交同一表单请求。
	// 页面在站点源下，fetch 自带同站点 Origin 与 Cookie；303 被跟随到首页。
	const loggedOut = await postForm(page, world.url('/_logout'), {});
	expect(loggedOut).toBe(200);
	expect((await page.goto(world.url('/docs/page-0')))?.status()).toBe(403);
	expect(
		(
			await request.get(`${backendOrigin}/api/v1/me`, {
				headers: { Authorization: `Bearer ${world.readerToken}` }
			})
		).status()
	).toBe(200);
	await context.close();
});

Then(
	'权限收窄即时阻断，主域名切换要求重新登录，移动端表单可用',
	async ({ page, request, context }) => {
		const world = await prepare(request);
		await signIn(page, world);
		const cookies = await context.cookies();
		expect(cookies.filter((c) => c.name.includes('space_reader'))).toHaveLength(2);
		expect(
			cookies
				.filter((c) => c.name.includes('space_reader'))
				.every((c) => c.secure && c.httpOnly && c.domain === world.host)
		).toBeTruthy();
		await world.mutation(
			request,
			'PUT',
			`${world.base}/sites/${world.site}/permissions/grants/user:${world.readerId}`,
			{ role: 'none' }
		);
		expect([403, 503]).toContain((await page.goto(world.url('/docs/page-0')))!.status());
		await expect
			.poll(async () => (await page.goto(world.url('/docs/page-0')))?.status(), { timeout: 15000 })
			.toBe(403);
		await world.mutation(
			request,
			'PUT',
			`${world.base}/sites/${world.site}/permissions/grants/user:${world.readerId}`,
			{ role: 'reader' }
		);
		const nextHost = 'next-' + world.host;
		const domain = await world.mutation(
			request,
			'POST',
			`${world.base}/sites/${world.site}/domains`,
			{ host: nextHost }
		);
		await seedDnsTxt(domain.txtName, domain.txtValue);
		await world.mutation(
			request,
			'POST',
			`${world.base}/sites/${world.site}/domains/${nextHost}:verify`
		);
		await world.mutation(
			request,
			'POST',
			`${world.base}/sites/${world.site}/domains/${nextHost}:setPrimary`
		);
		await expect
			.poll(
				async () => {
					await page.goto(world.url('/docs/page-0'));
					return new URL(page.url()).hostname;
				},
				{ timeout: 15000 }
			)
			.toBe(nextHost);
		await expect(page.getByRole('heading', { name: '登录后阅读', exact: true })).toBeVisible();
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto(`https://${nextHost}:${ingressPort}/_login?returnTo=%2Fdocs%2Fpage-0`);
		await page.screenshot({
			path: '../.scratch/dw-v1/runtime/private-reader/login-mobile.png',
			fullPage: true
		});
		expect(
			await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
		).toBeTruthy();
		// returnTo 只接受站内相对路径：GET 回落到首页，POST 以 422 拒绝。
		const bad = await page.goto(world.url('/_login?returnTo=https%3A%2F%2Fevil.test'));
		expect(bad?.status()).toBe(200);
		await expect(page.locator('form.login-form input[name="returnTo"]')).toHaveValue('/');
		const forged = await postForm(page, world.url('/_login'), {
			email: world.email,
			password: acceptancePassword,
			returnTo: 'https://evil.test'
		});
		expect(forged).toBe(422);
	}
);

Then('[短凭据] 有脚本自动续期保留搜索和原页面', async ({ page, request }) => {
	const world = await prepare(request);
	await signIn(page, world);
	const refreshes: string[] = [];
	page.on('request', (r) => {
		if (refreshUrl.test(r.url())) refreshes.push(r.url());
	});
	await expect
		.poll(
			async () =>
				page.evaluate(async () => {
					try {
						return (await fetch('/api/content/search?q=检索')).status;
					} catch {
						return 0;
					}
				}),
			{ timeout: 15000, intervals: [500] }
		)
		.toBe(401);
	const input = page.getByRole('combobox', { name: '搜索内容' });
	await input.fill('检索');
	await expect(page.getByRole('listbox').getByRole('option').first()).toContainText('检索指南');
	expect(refreshes).toHaveLength(1);
	await expect(page).toHaveURL(world.url('/docs/page-0'));
	await expect(input).toHaveValue('检索');
	await expect
		.poll(
			async () => page.evaluate(async () => (await fetch('/api/content/search?q=检索')).status),
			{ timeout: 15000, intervals: [500] }
		)
		.toBe(401);
	await page.goto(world.url('/docs/page-1'));
	await expect(page.locator('article')).toContainText('检索正文 1');
	await expect(page).toHaveURL(world.url('/docs/page-1'));
});

Then('[短凭据] 无脚本通过同域 POST 续期，共享主库故障保留凭据', async ({ browser, request }) => {
	const world = await prepare(request);
	const context = await browser.newContext({ javaScriptEnabled: false, ignoreHTTPSErrors: true });
	const page = await context.newPage();
	await signIn(page, world);
	await expect
		.poll(async () => (await page.goto(world.url('/docs/page-1')))?.status(), {
			timeout: 15000,
			intervals: [500]
		})
		.toBe(401);
	await expect(page.getByRole('button', { name: '继续阅读', exact: true })).toBeVisible();
	const before = await context.cookies();
	try {
		await runRuntimeCommand('docker', ['stop', '--time', '2', container('source')]);
		const response = page.waitForResponse((response) => refreshUrl.test(response.url()));
		await page.getByRole('button', { name: '继续阅读', exact: true }).click();
		const unavailable = await response;
		expect(unavailable.status()).toBe(503);
		const trace = unavailable.headers()['x-request-id'];
		expect(trace).toBeTruthy();
		expect(await unavailable.text()).toContain(trace);
		await page.screenshot({
			path: '../.scratch/dw-v1/runtime/private-reader/reader-unavailable.png',
			fullPage: true
		});
		expect((await context.cookies()).filter((c) => c.name.includes('space_reader'))).toEqual(
			before.filter((c) => c.name.includes('space_reader'))
		);
	} finally {
		await restorePrimary(request);
	}
	await page.goto(world.url('/docs/page-1'));
	await page.getByRole('button', { name: '继续阅读', exact: true }).click();
	await expect(page.locator('article')).toContainText('检索正文 1');
	await context.close();
});

Then('[短凭据] 自动续期遵守 Retry-After 且保留搜索', async ({ page, request }) => {
	const world = await prepare(request);
	await signIn(page, world);
	await expect
		.poll(
			async () => page.evaluate(async () => (await fetch('/api/content/search?q=检索')).status),
			{ timeout: 15000, intervals: [500] }
		)
		.toBe(401);
	let attempts = 0;
	await page.route('**/_auth/session/refresh', async (route) => {
		attempts++;
		if (attempts === 1)
			await route.fulfill({
				status: 429,
				headers: { 'Retry-After': '2', 'X-Request-Id': 'reader-cooldown' },
				contentType: 'text/plain',
				body: '请稍后重试'
			});
		else await route.continue();
	});
	const input = page.getByRole('combobox', { name: '搜索内容' });
	await input.fill('检索');
	const retry = page.getByRole('option', { name: '重试搜索' });
	await expect(retry).toBeDisabled();
	await expect(input).toHaveValue('检索');
	expect(attempts).toBe(1);
	await expect(retry).toBeEnabled({ timeout: 5000 });
	await retry.click();
	await expect(page.getByRole('listbox').getByRole('option').first()).toContainText('检索指南');
	expect(attempts).toBe(2);
	await expect(page).toHaveURL(world.url('/docs/page-0'));
});

Then('共享主库离线时拒绝阅读，恢复后既有会话仍可读取', async ({ page, request }) => {
	const world = await prepare(request);
	await signIn(page, world);
	await runRuntimeCommand('docker', ['stop', '--time', '2', container('source')]);
	try {
		const unavailable = await page.goto(world.url('/docs/page-1'));
		expect(unavailable?.status()).toBe(503);
		expect(await unavailable!.text()).not.toContain('检索正文 1');
	} finally {
		await restorePrimary(request);
	}
	expect((await page.goto(world.url('/docs/page-1')))?.status()).toBe(200);
	await expect(page.locator('article')).toContainText('检索正文 1');
	const attachment = await fetchBytes(page, world.url(world.attachmentPath));
	expect(attachment.status).toBe(200);
	expect(attachment.bytes.equals(world.attachmentBytes)).toBeTruthy();
});

Then('读者能新登录、续期并保存历史', async ({ page, request }) => {
	const world = await prepare(request);
	await signIn(page, world);
	const refreshed = await page.evaluate(
		async () => (await fetch('/_auth/session/refresh', { method: 'POST' })).status
	);
	expect(refreshed).toBe(204);
	await page.goto(world.url('/docs/page-1'));
	await expect(page.locator('article')).toContainText('检索正文 1');
	const history = await page.evaluate(async () => {
		const visit = await fetch('/_auth/history', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ spaceSlug: 'docs', pagePath: '/docs/page-1' })
		});
		return { status: visit.status, entries: await (await fetch('/_auth/history')).json() };
	});
	expect(history.status).toBe(204);
	expect(history.entries).toEqual(
		expect.arrayContaining([expect.objectContaining({ pagePath: '/docs/page-1' })])
	);
});

Then('搜索引擎离线时，既有会话仍可读取私有正文', async ({ page, request }) => {
	const world = await prepare(request);
	await signIn(page, world);
	await runRuntimeCommand('docker', ['stop', '--time', '2', container('search')]);
	try {
		expect((await page.goto(world.url('/docs/page-1')))?.status()).toBe(200);
		await expect(page.locator('article')).toContainText('检索正文 1');
		expect(
			await page.evaluate(async () => (await fetch('/api/content/search?q=检索')).status)
		).toBe(503);
	} finally {
		await runRuntimeCommand('docker', ['start', container('search')]);
	}
});

Then('全局停用读者账号确认后立即阻断旧阅读会话', async ({ page, request }) => {
	const world = await prepare(request);
	await signIn(page, world);
	const changed = await request.post(`${backendOrigin}/admin/users/${world.readerId}:deactivate`, {
		headers: { Authorization: `Bearer ${world.token}`, 'Idempotency-Key': crypto.randomUUID() },
		data: { confirmationEmail: world.email, currentPassword: acceptancePassword }
	});
	expect(changed.status(), await changed.text()).toBe(204);
	const first = await page.goto(world.url('/docs/page-0'));
	expect([401, 503]).toContain(first?.status());
	await expect
		.poll(async () => (await page.goto(world.url('/docs/page-0')))?.status(), {
			timeout: 15000,
			intervals: [500]
		})
		.toBe(401);
});

Given('私有阅读验收采用独立 HTTPS 拓扑', async ({ request }) => {
	expect((await request.get(readerOrigin + '/healthz')).status()).toBe(200);
	// HTTPS 入口同样把 /healthz 交给 Reader，并经 Caddy 到达。
	const ingress = await request.get(`https://127.0.0.1:${ingressPort}/healthz`, {
		ignoreHTTPSErrors: true,
		headers: { Host: `probe.acme.test:${ingressPort}` }
	});
	expect(ingress.status()).toBe(200);
});

async function restorePrimary(request: APIRequestContext) {
	await runRuntimeCommand('docker', ['start', container('source')]);
	await expect
		.poll(
			async () => {
				try {
					return (await request.get(`${backendOrigin}/health`, { timeout: 2000 })).status();
				} catch {
					return 0;
				}
			},
			{ timeout: 30000 }
		)
		.toBe(200);
}

Then('机器资源经 Caddy 完整分页读取并校验撤权与切版', async ({ request }) => {
	const world = await prepareIndependentDelivery(request);
	const root = '/api/content/spaces/docs';
	const fetch = (path: string, secret?: string, extra: Record<string, string> = {}) =>
		request.get(`https://127.0.0.1:${ingressPort}${path}`, {
			ignoreHTTPSErrors: true,
			headers: {
				Host: world.host,
				...(secret ? { Authorization: `Bearer ${secret}` } : {}),
				...extra
			}
		});
	const anonymous = await fetch(`${root}/snapshot`);
	expect(anonymous.status()).toBe(200);
	await world.mutation(
		request,
		'DELETE',
		`${world.base}/sites/${world.site}/permissions/grants/anonymous`
	);
	const issued = await world.mutation(request, 'POST', `${world.base}/tokens`, {
		name: 'reader-resource-test',
		spaceId: world.space,
		role: 'reader',
		scopes: ['read'],
		expiry: new Date(Date.now() + 3600_000).toISOString()
	});
	const secret: string = issued.secret;
	expect(typeof secret).toBe('string');
	await expect
		.poll(async () => (await fetch(`${root}/snapshot`, secret)).status(), { timeout: 15000 })
		.toBe(200);
	const mount = await (await fetch(`${root}/snapshot`, secret)).json();
	const version = `snapshot=${encodeURIComponent(mount.snapshot)}`;
	const entries: {
		path: string;
		kind: string;
		pageId: string | null;
		format: string | null;
		sha256: string | null;
	}[] = [];
	let cursor: string | null = null;
	do {
		const response = await fetch(
			`${root}/files?${version}&limit=3${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`,
			secret
		);
		expect(response.status()).toBe(200);
		const body = await response.json();
		entries.push(...body.entries);
		cursor = body.nextCursor;
	} while (cursor);
	expect(new Set(entries.map((e) => e.path)).size).toBe(entries.length);
	const pages = entries.filter((entry) => typeof entry.format === 'string');
	expect(pages.map((entry) => entry.path).sort()).toEqual(
		Array.from({ length: 24 }, (_, i) => `/page-${i}`).sort()
	);
	expect(pages.every((entry) => entry.kind === 'file' && entry.pageId)).toBeTruthy();
	const toc = await (await fetch(`${root}/toc?${version}`, secret)).json();
	expect(toc.nodes).toHaveLength(1);
	expect(toc.nodes[0].kind).toBe('group');
	expect(toc.nodes[0].children.some((node: { kind: string }) => node.kind === 'group')).toBe(true);
	expect(toc.nodes[0].children.some((node: { kind: string }) => node.kind === 'link')).toBe(true);
	const contentUrl = `${root}/content?${version}&path=${encodeURIComponent('/page-0')}`;
	const original = await fetch(contentUrl, secret);
	expect(original.status()).toBe(200);
	expect(await original.text()).toBe('检索正文 0\n\n## 中文配置\n\nWebhook 配置说明。');
	const etag = original.headers().etag;
	expect((await fetch(contentUrl, secret, { 'If-None-Match': etag })).status()).toBe(304);
	const attachment = entries.find((e) => e.kind === 'file' && e.format === null)!;
	expect(attachment).toBeTruthy();
	const downloaded = await fetch(
		`${root}/content?${version}&path=${encodeURIComponent(attachment.path)}`,
		secret
	);
	expect(downloaded.status()).toBe(200);
	expect((await downloaded.body()).equals(world.attachmentBytes)).toBeTruthy();
	await expect
		.poll(
			async () =>
				(await fetch(`/api/content/search?spaceSlug=docs&${version}&q=Webhook`, secret)).status(),
			{ timeout: 15000 }
		)
		.toBe(200);
	const results = await (
		await fetch(`/api/content/search?spaceSlug=docs&${version}&q=Webhook`, secret)
	).json();
	expect(results.hits.length).toBeGreaterThan(0);
	expect(results.hits.every((hit: { spaceSlug: string }) => hit.spaceSlug === 'docs')).toBeTruthy();
	expect((await fetch(contentUrl, 'invalid')).status()).toBe(401);
	expect(
		(
			await request.post(`https://127.0.0.1:${ingressPort}${root}/files`, {
				ignoreHTTPSErrors: true,
				headers: { Host: world.host, Authorization: `Bearer ${secret}` }
			})
		).status()
	).toBe(403);
	await world.mutation(request, 'PATCH', `${world.base}/sites/${world.site}`, {
		branding: { primaryColor: '#234567' }
	});
	await expect
		.poll(async () => (await fetch(contentUrl, secret)).status(), { timeout: 15000 })
		.toBe(409);
	const newMount = await (await fetch(`${root}/snapshot`, secret)).json();
	const currentUrl = `${root}/content?snapshot=${encodeURIComponent(newMount.snapshot)}&path=${encodeURIComponent('/page-0')}`;
	expect((await fetch(currentUrl, secret)).status()).toBe(200);
	await world.mutation(request, 'DELETE', `${world.base}/tokens/${issued.id}`);
	expect([401, 503]).toContain(
		(await fetch(currentUrl, secret, { 'If-None-Match': etag })).status()
	);
	await expect
		.poll(async () => (await fetch(currentUrl, secret, { 'If-None-Match': etag })).status(), {
			timeout: 15000
		})
		.toBe(401);
});
