/** One suite assignment per executable specification. Catalog integrity is checked by infra/quality. */
import catalog from '../../features/acceptance/catalog.json' with { type: 'json' };

type Suite = 'delivery' | 'private';

export function specificationFiles(suite: Suite) {
	return catalog.features
		.filter((feature) => feature.suite === suite)
		.map((feature) => `../features/acceptance/${feature.file}`);
}

export function stepFiles(suite: Suite) {
	return [
		'e2e/fixtures.ts',
		...catalog.features
			.filter((feature) => feature.suite === suite)
			.map((feature) => feature.steps!.replace(/^acceptance\//, ''))
	];
}
