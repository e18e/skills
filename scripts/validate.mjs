import { readFile } from 'node:fs/promises';
import { glob } from 'node:fs/promises';
import { basename, dirname } from 'node:path';

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

function field(block, key) {
  const match = block.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim() : null;
}

const errors = [];

for await (const file of glob('skills/*/SKILL.md')) {
  const source = await readFile(file, 'utf8');
  const match = source.match(FRONTMATTER);

  if (!match) {
    errors.push(`${file}: missing YAML frontmatter`);
    continue;
  }

  const block = match[1];
  const name = field(block, 'name');
  const description = field(block, 'description');
  const dir = basename(dirname(file));

  if (!name) {
    errors.push(`${file}: missing \`name\``);
  } else if (name !== dir) {
    errors.push(`${file}: \`name\` (${name}) must match directory (${dir})`);
  }

  if (!description) {
    errors.push(`${file}: missing \`description\``);
  }
}

if (errors.length > 0) {
  console.error(
    `Skill validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
  );
  process.exit(1);
}

console.log('All skills valid.');
