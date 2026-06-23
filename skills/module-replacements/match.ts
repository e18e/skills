import { readFile } from 'node:fs/promises';
import { all, resolveDocUrl, type KnownUrl } from './vendor/dist/main.js';

// Replace a replacement's `url` with a resolved `docUrl`, dropping it when none.
function withDocUrl<T extends { url?: KnownUrl }>(obj: T) {
  const { url, ...rest } = obj;
  const docUrl = resolveDocUrl(obj.url);
  return docUrl ? { ...rest, docUrl } : rest;
}

function resolve(name: string) {
  const mapping = all.mappings[name];
  if (!mapping) {
    throw new Error(`No mapping found for ${name}`);
  }
  const { moduleName, replacements: ids, url } = mapping;
  const resolved = ids
    .map((id) => all.replacements[id])
    .filter((r) => r != null)
    .map(withDocUrl);
  const docUrl = resolveDocUrl(url);
  return docUrl
    ? { moduleName, docUrl, replacements: resolved }
    : { moduleName, replacements: resolved };
}

// Reduce a specifier to its package name: `lodash/get` -> `lodash`,
// `@scope/pkg/sub` -> `@scope/pkg`, leaving builtins like `node:fs` untouched.
function packageName(spec: string): string {
  if (spec.startsWith('node:')) return spec;
  const parts = spec.split('/');
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]!;
}

async function fromPackageJson(): Promise<string[]> {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  return [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
    ...Object.keys(pkg.optionalDependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ];
}

const input = process.argv.slice(2);
const names = input.length > 0 ? input : await fromPackageJson();

const seen = new Set<string>();
const results: unknown[] = [];
for (const raw of names) {
  for (const candidate of new Set([raw, packageName(raw)])) {
    if (candidate in all.mappings && !seen.has(candidate)) {
      seen.add(candidate);
      results.push(resolve(candidate));
    }
  }
}

if (results.length === 0) {
  console.log('No known replacements found.');
} else {
  console.log(JSON.stringify(results, null, 2));
}
