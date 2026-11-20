import { expect, type APIRequestContext } from '@playwright/test';
import { backendOrigin, browserOrigin } from './environment';
import { verificationFor } from './mailbox';

export const acceptancePassword = 'password1';

export function unique(prefix: string) {
	return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export { verificationFor };

export async function createVerifiedUser(request: APIRequestContext, prefix: string) {
	const email = `${unique(prefix)}@e2e.test`;
	const registered = await request.post(`${backendOrigin}/auth/register`, {
		data: { email, name: '租户验收用户', password: acceptancePassword }
	});
	expect(registered.status()).toBe(201);
	const challenge = await verificationFor(email);
	expect(
		(await request.post(`${backendOrigin}/auth/email:verify`, { data: challenge })).status()
	).toBe(204);
	return email;
}

export async function apiLogin(request: APIRequestContext, email: string) {
	const response = await request.post(`${backendOrigin}/auth/login`, {
		headers: { Origin: browserOrigin },
		data: { email, password: acceptancePassword }
	});
	expect(response.status()).toBe(200);
	return (await response.json()).accessToken as string;
}
