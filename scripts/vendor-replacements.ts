import { cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pkgRoot = join(root, 'node_modules', 'module-replacements');
const vendor = join(root, 'skills', 'module-replacements', 'vendor');

await rm(vendor, { recursive: true, force: true });
for (const dir of ['dist', 'manifests']) {
  await cp(join(pkgRoot, dir), join(vendor, dir), { recursive: true });
}

console.log(`Vendored module-replacements into ${vendor}`);
