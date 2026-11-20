import { resolve } from 'node:path';

/** Resolve from the material directory, independently of a business step's nesting depth. */
export const packZip = (id: string) =>
	resolve(import.meta.dirname, `../fixtures/import-packs/${id}.zip`);
