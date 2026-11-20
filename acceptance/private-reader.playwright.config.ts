import { defineBddProject } from 'playwright-bdd';
import { defineConfig } from '@playwright/test';
import { specificationFiles, stepFiles } from './e2e/specification';
export default defineConfig({
	forbidOnly: true,
	projects: [
		defineBddProject({
			name: 'private-reader',
			featuresRoot: '..',
			features: specificationFiles('private'),
			steps: stepFiles('private')
		})
	],
	timeout: 120_000,
	workers: 1,
	use: {
		ignoreHTTPSErrors: true,
		launchOptions: { args: ['--host-resolver-rules=MAP *.acme.test 127.0.0.1'] },
		reducedMotion: 'reduce',
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure'
	},
	reporter: [
		['list'],
		['json', { outputFile: '../.scratch/dw-v1/runtime/private-reader/browser-results.json' }]
	]
});
