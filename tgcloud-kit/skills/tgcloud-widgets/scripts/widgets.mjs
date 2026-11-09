#!/usr/bin/env node
// Turns each widgets/<name>.html into tgcloud/lib/widgets/<name>.html.js, a
// module whose default export is the HTML as a string. tgcloud has no
// filesystem at runtime, so the bot sends the widget from that module:
//   import COUNTER from './counter.html.js';
//   api.sendWidget({ chat_id, html: COUNTER, … })
//
// It also checks Telegram's limits: at most 32768 bytes of UTF-8, no NUL
// character, and at most 4096 bytes after zlib at level 9. Python's zlib
// counts exactly as the server does, so it's used when python3 is installed.
// Node's zlib is used otherwise and can be a few dozen bytes off.
//
//   node scripts/widgets.mjs           write the modules, print the sizes
//   node scripts/widgets.mjs --check   fail if a module is missing or out of date, or a widget is too big

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';

const SRC = 'widgets';
const OUT = join('tgcloud', 'lib', 'widgets');
const MAX_HTML = 32768;
const MAX_ZIPPED = 4096;
const check = process.argv.includes('--check');

function zippedSize(bytes) {
  try {
    const out = execFileSync('python3', ['-I', '-c', 'import sys,zlib; print(len(zlib.compress(sys.stdin.buffer.read(), 9)))'],
      { input: bytes, stdio: ['pipe', 'pipe', 'ignore'] });
    return { size: Number(String(out).trim()), exact: true };
  } catch {
    return { size: deflateSync(bytes, { level: 9 }).length + 6, exact: false };   // + zlib header and checksum
  }
}

if (!existsSync(SRC)) {
  console.log(`No ${SRC}/ folder: nothing to do.`);
  process.exit(0);
}

const files = readdirSync(SRC).filter((f) => f.endsWith('.html')).sort();
let failed = false;
mkdirSync(OUT, { recursive: true });

for (const file of files) {
  const name = file.slice(0, -'.html'.length);
  const html = readFileSync(join(SRC, file), 'utf8').trim();
  const bytes = Buffer.from(html, 'utf8');
  const { size, exact } = zippedSize(bytes);
  const problems = [];
  if (!bytes.length) problems.push('empty');
  if (html.includes('\u0000')) problems.push('contains a NUL character');
  if (bytes.length > MAX_HTML) problems.push(`${bytes.length} bytes > ${MAX_HTML}`);
  if (size > MAX_ZIPPED) problems.push(`${size} bytes compressed > ${MAX_ZIPPED}`);

  const target = join(OUT, `${name}.html.js`);
  const module = `// Generated from widgets/${file} by \`npm run widgets\`. Don't edit: change the .html and re-run.\nexport default ${JSON.stringify(html)};\n`;
  const current = existsSync(target) ? readFileSync(target, 'utf8') : null;

  if (check && current !== module) problems.push(`${target} is out of date: run \`npm run widgets\``);
  if (!check && current !== module) writeFileSync(target, module);

  const note = exact ? '' : ' (node zlib; install python3 for the exact count)';
  const near = !exact && size > MAX_ZIPPED - 100 ? ' ⚠ close to the limit' : '';
  console.log(`  ${problems.length ? '✗' : '✓'} ${file}: ${bytes.length} B, ${size} B compressed${note}${near}`);
  for (const p of problems) console.log(`      ${p}`);
  if (problems.length) failed = true;
}

if (!files.length) console.log(`No .html files in ${SRC}/.`);
process.exit(failed ? 1 : 0);
