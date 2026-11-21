import { expect, type APIRequestContext } from '@playwright/test';
import { createVerifiedUser, apiLogin, unique } from '../accounts';
import { markPlatformOperator, seedDnsTxt } from '../ops-sql';
import { backendOrigin, deliveryOrigin } from '../environment';
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
	const email = await createVerifiedUser(request, 'delivery');
	await markPlatformOperator(email);
	const token = await apiLogin(request, email);
	const provision = await mutation(request, 'POST', `${backendOrigin}/admin/tenants`, {
		name: unique('交付验收'),
		ownerEmail: email
	});
	const base = `${backendOrigin}/api/v1/tenants/${provision.tenant.id}`;
	const space = (
		await mutation(request, 'POST', `${base}/spaces`, { name: '检索指南', mode: 'authored' })
	).id;
	await mutation(request, 'PATCH', `${base}/spaces/${space}`, { autoRelease: false });
	const pages = `${base}/spaces/${space}/pages`;
	const page = await mutation(request, 'POST', pages, { title: '检索指南', format: 'markdown', slug: 'start' });
	await mutation(request, 'PUT', `${pages}/${page.id}/content`, { content: '检索正文：Edition 使用指南。' }, { 'If-Match': '"rev-0"' });
	await mutation(request, 'POST', `${pages}/${page.id}:publish`);
	await mutation(request, 'POST', `${base}/spaces/${space}/toc/entries`, { label: '使用指南', kind: 'target', targetId: page.id });
	await mutation(request, 'POST', `${base}/spaces/${space}/releases:build`);
	const site = (await mutation(request, 'POST', `${base}/sites`, { name: '交付验收站' })).id;
	await mutation(request, 'PUT', `${base}/sites/${site}/mounts/docs`, { spaceId: space });
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
	return {
		host,
		read: (path: string) => request.get(reader + path, { headers: { Host: host } }),
		revokeAnonymous: () => mutation(request, 'DELETE', `${base}/sites/${site}/permissions/grants/anonymous`),
	};
}
