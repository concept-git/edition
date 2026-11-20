/* Playwright 要求 fixture 回调第一个参数必须是对象解构，即使没有依赖。 */
/* eslint-disable no-empty-pattern -- Playwright fixture callback signature */
import { test as base, createBdd } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { prepareIndependentDelivery } from './support/delivery/prepare';

export const test = base.extend<{
 browserDiagnostics: void;
 independentDelivery: Awaited<ReturnType<typeof prepareIndependentDelivery>>;
}>({
	browserDiagnostics: [
		async ({ context }, use, testInfo) => {
			const problems: string[] = [];
			const transportMessages: string[] = [];
			context.on('page', (page) => {
				page.on('pageerror', (error) => problems.push(`Uncaught: ${error.message}`));
				page.on('console', (message) => {
					if (!['warning', 'error'].includes(message.type())) return;
					// Chrome also logs HTTP rejections exercised by negative scenarios; the scenario asserts those responses.
					if (/^Failed to load resource:|^net::ERR_/.test(message.text())) {
						transportMessages.push(message.text());
						return;
					}
					problems.push(`${message.type()}: ${message.text()}`);
				});
			});
			await use();
			if (transportMessages.length)
				await testInfo.attach('browser-transport-messages', {
					body: JSON.stringify(transportMessages),
					contentType: 'application/json'
				});
			expect(
				problems,
				'No uncaught browser exceptions or application console warnings/errors'
			).toEqual([]);
		},
		{ auto: true }
	],
	independentDelivery: async ({ request }, use) => {
		await use(await prepareIndependentDelivery(request));
	},
});

export const { Given, When, Then, After, Before } = createBdd(test);
