import { createHash } from 'node:crypto';
import { expect, type APIRequestContext } from '@playwright/test';
import { createVerifiedUser, apiLogin, unique } from '../accounts';
import { markPlatformOperator, seedDnsTxt } from '../ops-sql';
import { backendOrigin, deliveryOrigin, readerOrigin } from '../environment';
// 阅读页面、/api/content/*、/_auth/* 都经边缘入口；Reader 自身只用于探活。
const reader = deliveryOrigin;

export async function prepareIndependentDelivery(request: APIRequestContext) {
	const headers = () => ({
		Authorization: `Bearer ${token}`,
		'Idempotency-Key': crypto.randomUUID()
	});
	async function mutation(
		request: APIRequestContext,
		method: string,
		path: string,
		data?: unknown,
		extra = {}
	) {
		const response = await request.fetch(path, {
			method,
			headers: { ...headers(), ...extra },
			data
		});
		expect(
			response.ok(),
			`${method} ${path}: ${response.status()} ${await response.text()}`
		).toBeTruthy();
		return response.status() === 204 ? null : response.json();
	}
	// 页面资源对附件回 303 到快照内容资源（相对地址）。Playwright 跟随跳转时不保证保留自定义 Host，
	// 而站点由 Host 决定，所以这里手动跟随，每一跳都带同一个站点 Host。
	const get = async (request: APIRequestContext, path: string) => {
		let target = path;
		for (let hop = 0; ; hop++) {
			const response = await request.get(reader + target, {
				headers: { Host: host },
				maxRedirects: 0
			});
			const location = response.headers().location;
			if (![301, 302, 303].includes(response.status()) || !location || hop >= 5) return response;
			const next = new URL(location, reader);
			target = next.pathname + next.search;
		}
	};
	const url = (path: string) =>
		`${new URL(reader).protocol}//${host}:${new URL(reader).port}${path}`;

	await expect
		.poll(
			async () => {
				try {
					return (await request.get(`${backendOrigin}/health`)).status();
				} catch {
					return 0;
				}
			},
			{ timeout: 30_000 }
		)
		.toBe(200);
	await expect
		.poll(
			async () => {
				try {
					return (await request.get(readerOrigin + '/healthz')).status();
				} catch {
					return 0;
				}
			},
			{ timeout: 30000 }
		)
		.toBe(200);
	const email = await createVerifiedUser(request, 'delivery');
	await markPlatformOperator(email);
	const token = await apiLogin(request, email);
	const provision = await mutation(request, 'POST', `${backendOrigin}/admin/tenants`, {
		name: unique('交付验收'),
		ownerEmail: email
	});
	const me = await request.get(`${backendOrigin}/api/v1/me`, { headers: headers() });
	const identity = await me.json();
	const tenantId = provision.tenant?.id ?? provision.id ?? identity.tenants.at(-1).id;
	const base = `${backendOrigin}/api/v1/tenants/${tenantId}`;
	const space = (
		await mutation(request, 'POST', `${base}/spaces`, { name: '检索指南', mode: 'authored' })
	).id;
	await mutation(request, 'PATCH', `${base}/spaces/${space}`, { autoRelease: false });
	const pageIds: string[] = [];
	for (let i = 0; i < 24; i++) {
		const page = await mutation(request, 'POST', `${base}/spaces/${space}/pages`, {
			title: `检索指南 ${i}`,
			format: 'markdown',
			slug: `page-${i}`
		});
		pageIds.push(page.id);
		await mutation(
			request,
			'PUT',
			`${base}/spaces/${space}/pages/${page.id}/content`,
			{ content: `检索正文 ${i}\n\n## 中文配置\n\nWebhook 配置说明。` },
			{ 'If-Match': '"rev-0"' }
		);
		await mutation(request, 'POST', `${base}/spaces/${space}/pages/${page.id}:publish`);
	}
	const rootTree = await mutation(request, 'POST', `${base}/spaces/${space}/toc/entries`, {
		label: '检索指南',
		kind: 'group'
	});
	const rootGroup = rootTree.entries.find((entry: { label: string }) => entry.label === '检索指南');
	expect(rootGroup?.id).toBeTruthy();
	await mutation(request, 'POST', `${base}/spaces/${space}/toc/entries`, {
		parentId: rootGroup.id,
		label: '检索指南 0',
		kind: 'target',
		targetId: pageIds[0]
	});
	const nestedTree = await mutation(request, 'POST', `${base}/spaces/${space}/toc/entries`, {
		parentId: rootGroup.id,
		label: '进阶',
		kind: 'group'
	});
	const nestedGroup = nestedTree.entries
		.find((entry: { id: string }) => entry.id === rootGroup.id)
		?.children.find((entry: { label: string }) => entry.label === '进阶');
	expect(nestedGroup?.id).toBeTruthy();
	await mutation(request, 'POST', `${base}/spaces/${space}/toc/entries`, {
		parentId: nestedGroup.id,
		label: '检索指南 1',
		kind: 'target',
		targetId: pageIds[1]
	});
	await mutation(request, 'POST', `${base}/spaces/${space}/toc/entries`, {
		parentId: rootGroup.id,
		label: '外部资料',
		kind: 'link',
		url: 'https://example.com/'
	});
	const attachmentBytes = Buffer.concat([
		Buffer.from(
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
			'base64'
		),
		Buffer.from(crypto.randomUUID())
	]);
	const attachmentHash = createHash('sha256').update(attachmentBytes).digest('hex');
	const uploaded = await request.post(`${base}/spaces/${space}/pages/${pageIds[0]}/attachments`, {
		headers: headers(),
		multipart: { file: { name: 'sample.png', mimeType: 'image/png', buffer: attachmentBytes } }
	});
	expect(uploaded.status(), await uploaded.text()).toBe(201);
	const attachmentPath = `/docs/attachments/${attachmentHash}/sample.png`;
	const built = await mutation(request, 'POST', `${base}/spaces/${space}/releases:build`);
	const originalReleaseId: string = built.release.id;
	const examples = (
		await mutation(request, 'POST', `${base}/spaces`, { name: '阅读案例', mode: 'authored' })
	).id;
	const examplePage = (
		await mutation(request, 'POST', `${base}/spaces/${examples}/pages`, {
			title: '案例首页',
			format: 'markdown',
			slug: 'start'
		})
	).id;
	await mutation(
		request,
		'PUT',
		`${base}/spaces/${examples}/pages/${examplePage}/content`,
		{
			content: '# 案例首页\n\n## 切换空间\n\n从顶部返回指南。'
		},
		{ 'If-Match': '"rev-0"' }
	);
	await mutation(request, 'POST', `${base}/spaces/${examples}/pages/${examplePage}:publish`);
	await mutation(request, 'POST', `${base}/spaces/${examples}/toc/entries`, {
		label: '案例首页',
		kind: 'target',
		targetId: examplePage
	});
	const site = (await mutation(request, 'POST', `${base}/sites`, { name: '交付验收站' })).id;
	await mutation(request, 'PUT', `${base}/sites/${site}/mounts/docs`, { spaceId: space });
	await mutation(request, 'PUT', `${base}/sites/${site}/mounts/examples`, { spaceId: examples });
	await mutation(request, 'PATCH', `${base}/sites/${site}`, {
		locale: 'zh-CN',
		home: space,
		branding: { primaryColor: '#176b53' }
	});
	await mutation(request, 'PUT', `${base}/sites/${site}/permissions/grants/anonymous`, {
		role: 'reader'
	});
	const host = `${unique('delivery')}.acme.test`;
	const domain = await mutation(request, 'POST', `${base}/sites/${site}/domains`, { host });
	await seedDnsTxt(domain.txtName, domain.txtValue);
	await mutation(request, 'POST', `${base}/sites/${site}/domains/${host}:verify`);
	await expect
		.poll(
			async () => {
				const response = await get(request, '/api/content/search?q=检索&limit=20');
				return response.status() === 200 ? (await response.json()).hits.length : 0;
			},
			{ timeout: 10_000 }
		)
		.toBe(20);

	return {
		originalReleaseId,
		token,
		base,
		space,
		site,
		host,
		pageIds,
		mutation,
		get,
		url,
		attachmentPath,
		attachmentBytes
	};
}
