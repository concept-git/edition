import { defineConfig } from '@playwright/test';
import { defineBddProject } from 'playwright-bdd';
import { specificationFiles, stepFiles } from './e2e/specification';
const delivery = defineBddProject({
	name: 'delivery',
	featuresRoot: '..',
	features: specificationFiles('delivery'),
	steps: stepFiles('delivery')
});
export default defineConfig({
	forbidOnly: true,
	projects: [delivery],
	timeout: 120_000,
	workers: 1,
	use: {
		launchOptions: { args: ['--host-resolver-rules=MAP *.acme.test 127.0.0.1'] },
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure'
	},
	reporter: [
		['list'],
		['json', { outputFile: '../.scratch/dw-v1/runtime/delivery-browser-results.json' }]
	]
});
