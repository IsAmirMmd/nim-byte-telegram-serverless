#!/usr/bin/env node
// Creates a new Telegram Serverless bot from tgcloud-kit in one command.
//
//   node scripts/create-bot.mjs <folder> --admin <your telegram user id> [--mini-app]
//        [--title "<app title>"] [--no-install] [--no-claude-settings]
//
// or, without cloning this repository:
//
//   npx github:IsAmirMmd/nim-byte-telegram-serverless <folder> --admin <id> [--mini-app]
//
// 1. `tgcloud init` in the folder (skipped when it already has tgcloud/)
// 2. the kit's scaffold: tgcloud-kit/skills/tgcloud-bot/scripts/scaffold.mjs
// 3. `npm install` and `npm test` (skip with --no-install)
//
// Node built-ins only. The bot's own folder becomes its own git repository.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = '@tgcloud/cli@0.2.0';
const SCAFFOLD = join(dirname(fileURLToPath(import.meta.url)), '..', 'tgcloud-kit', 'skills', 'tgcloud-bot', 'scripts', 'scaffold.mjs');

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const value = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const WITH_VALUE = new Set(['--admin', '--title']);
const positional = args.filter((a, i) => !a.startsWith('-') && !WITH_VALUE.has(args[i - 1]));
const folder = positional[0];
const admin = value('--admin') ?? positional[1];

const usage = `Usage: create-bot <folder> --admin <your telegram user id> [--mini-app] [--title "<app title>"] [--no-install] [--no-claude-settings]

  <folder>     a new or empty folder for the bot (it becomes its own git repository)
  --admin      your numeric Telegram id: send any message to @userinfobot to get it
  --mini-app   also create a React Mini App (served at https://app<id>.tgcloud.ai/)`;

if (has('--help') || has('-h')) {
  console.log(usage);
  process.exit(0);
}
if (!folder || !/^\d+$/.test(admin ?? '')) {
  console.error(usage);
  process.exit(1);
}
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 12)) {
  console.error(`Node.js 22.12 or newer is needed (this is ${process.version}).`);
  process.exit(1);
}

const dir = resolve(folder);
const shell = process.platform === 'win32';   // npm/npx are .cmd files on Windows
// When this script itself runs through `npx`, npm passes its own --package/--call
// down as env vars; they would hijack the inner `npx`/`npm` calls.
const env = Object.fromEntries(Object.entries(process.env)
  .filter(([k]) => !/^npm_config_(package|call|yes)$/i.test(k)));

function run(command, commandArgs, { useShell = false } = {}) {
  console.log(`\n$ ${[command === process.execPath ? 'node' : command, ...commandArgs].join(' ')}`);
  const r = spawnSync(command, commandArgs, { cwd: dir, stdio: 'inherit', shell: useShell, env });
  if (r.status !== 0) {
    console.error(`\n✗ failed (exit ${r.status ?? r.signal}). Fix the error above and run the same command again: it is safe to re-run.`);
    process.exit(r.status || 1);
  }
}

mkdirSync(dir, { recursive: true });
if (existsSync(join(dir, 'tgcloud'))) {
  console.log(`${dir} is already a tgcloud project: init skipped.`);
} else {
  const other = readdirSync(dir).filter((name) => name !== '.git');
  if (other.length) {
    console.error(`${dir} is not empty and has no tgcloud/ folder. Use a new or empty folder.`);
    process.exit(1);
  }
  run('npx', ['-y', `--package=${CLI}`, 'tgcloud', 'init'], { useShell: shell });
}

run(process.execPath, [
  SCAFFOLD, '.', '--admin', admin,
  ...(has('--mini-app') ? ['--mini-app'] : []),
  ...(value('--title') ? ['--title', value('--title')] : []),
  ...(has('--no-claude-settings') ? ['--no-claude-settings'] : []),
]);

if (!has('--no-install')) {
  run('npm', ['install', '--no-audit', '--no-fund'], { useShell: shell });
  run('npm', ['test'], { useShell: shell });
}

const cd = relative(process.cwd(), dir) || '.';
console.log(`
✓ The bot is ready in ${dir}

Next (in that folder):
  cd ${cd}
  npx tgcloud login        # paste the CLI token: BotFather → your bot → Serverless → CLI Access
  npm run deploy           # upload the code${has('--mini-app') ? ' and the built Mini App' : ''}
  npx tgcloud migrate      # create the database tables
Then send /start to your bot, and open the folder in your AI agent to add features.
Guide: https://isamirmmd.github.io/nim-byte-telegram-serverless/`);
