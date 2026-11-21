import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../src/', import.meta.url));
const errors = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'generated') await walk(path);
      continue;
    }
    if (!/\.[jt]sx?$/.test(entry.name)) continue;
    const source = relative(root, path).replaceAll('\\', '/');
    const text = await readFile(path, 'utf8');
    for (const match of text.matchAll(
      /(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g,
    )) {
      const target = match[1].startsWith('@/')
        ? match[1].slice(2)
        : match[1].startsWith('.')
          ? relative(root, resolve(dirname(path), match[1])).replaceAll(
              '\\',
              '/',
            )
          : match[1];
      if (source.startsWith('shared/') && target.startsWith('features/'))
        errors.push(`${source}: shared depends on feature ${target}`);
      const feature = source.match(/^features\/([^/]+)\//)?.[1];
      const other = target.match(/^features\/([^/]+)\/(.+)/);
      if (feature && other && feature !== other[1] && other[2] !== 'index')
        errors.push(`${source}: imports another feature's internal ${target}`);
      if (
        source.includes('/domain/') &&
        (/react|tanstack|openapi-fetch/.test(target) ||
          target.includes('/data/') ||
          target.includes('/presentation/'))
      )
        errors.push(`${source}: domain depends on framework or I/O ${target}`);
      if (source.includes('/presentation/') && target.includes('/data/'))
        errors.push(
          `${source}: presentation bypasses the feature contract ${target}`,
        );
    }
  }
}
await walk(root);
if (errors.length) throw new Error(errors.join('\n'));
console.log('Feature-first source boundaries checked.');
