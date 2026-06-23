import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const { version } = JSON.parse(await readFile('package.json', 'utf8'));

const plugin = JSON.parse(await readFile('.claude-plugin/plugin.json', 'utf8'));
plugin.version = version;
await writeFile(
  '.claude-plugin/plugin.json',
  JSON.stringify(plugin, null, 2) + '\n',
);

const marketplace = JSON.parse(
  await readFile('.claude-plugin/marketplace.json', 'utf8'),
);
marketplace.metadata.version = version;
await writeFile(
  '.claude-plugin/marketplace.json',
  JSON.stringify(marketplace, null, 2) + '\n',
);

console.log(`Synced version ${version} to plugin and marketplace manifests.`);

spawnSync('npm run format', { stdio: 'inherit', shell: true });
