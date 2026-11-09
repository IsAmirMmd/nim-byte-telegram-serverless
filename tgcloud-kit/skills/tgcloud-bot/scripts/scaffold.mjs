#!/usr/bin/env node
// Overlays the tgcloud-kit templates onto a project made by `tgcloud init`.
//
//   node scaffold.mjs <project-dir> --admin <telegram user id> [--mini-app] [--title "<app title>"]
//                     [--no-claude-settings]
//
// - Bot: tgcloud/ (schema, lib, handlers, endpoints), test/ (offline tests on
//   a mock SDK), .github/workflows/deploy.yml, docs/ARCHITECTURE.md,
//   docs/BOT-API.md, npm scripts.
//   No admin routes or admin commands: those are added on request (the
//   tgcloud-bot skill's references/admin-tools.md).
// - --mini-app: a React + Vite front-end that follows the Telegram theme, its
//   endpoint (feedback), and tgcloud.jsonc → "static".
// - .claude/settings.json: enables the tgcloud-kit plugin for everyone who
//   opens the project in Claude Code (skip with --no-claude-settings).
//
// Never overwrites a file the user wrote; only the stock `tgcloud init`
// versions of schema.js and handlers/message.js are replaced. Safe to re-run.
// In a project with its own schema.js, tgcloud/ is left alone and only the
// infrastructure (CI, test harness, docs) is added.

import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, appendFileSync } from 'node:fs';
import { join, dirname, relative, extname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- arguments ----------

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const positional = args.filter((a, i) => !a.startsWith('--') && !['--admin', '--title'].includes(args[i - 1]));
const dir = positional[0];
const adminId = option('--admin') ?? positional[1];   // also: scaffold.mjs <dir> <admin id>
const miniApp = flag('--mini-app');
const title = option('--title') ?? 'اپ ربات';

if (!dir || !/^\d+$/.test(adminId ?? '')) {
  console.error('Usage: node scaffold.mjs <project-dir> --admin <telegram user id> [--mini-app] [--title "<app title>"] [--no-claude-settings]');
  process.exit(1);
}

const SKILLS = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BOT_TEMPLATE = join(SKILLS, 'tgcloud-bot', 'assets', 'template');
const APP_TEMPLATE = join(SKILLS, 'tgcloud-mini-app', 'assets', 'app');
const ARCHITECTURE = join(SKILLS, 'tgcloud-bot', 'references', 'architecture.md');
const ADMIN_TOOLS = join(SKILLS, 'tgcloud-bot', 'references', 'admin-tools.md');
const BOT_API = join(SKILLS, 'tgcloud-bot', 'references', 'bot-api.md');

// The marketplace that serves this kit (see the repo's .claude-plugin/marketplace.json).
const MARKETPLACE = { name: 'nim-byte', repo: 'IsAmirMmd/nim-byte-telegram-serverless' };

// Files `tgcloud init` writes that the template replaces, recognized by a line of theirs.
const INIT_STOCK = {
  'tgcloud/schema.js': 'Uncomment to define your first table',
  'tgcloud/handlers/message.js': 'Echo the text back',
};
const TEXT = new Set(['.js', '.mjs', '.jsx', '.json', '.jsonc', '.md', '.yml', '.yaml', '.css', '.html', '.txt']);
const PLACEHOLDERS = { __ADMIN_ID__: adminId, __APP_TITLE__: title };

// ---------- copying ----------

function* walk(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

function fill(text) {
  return Object.entries(PLACEHOLDERS).reduce((t, [k, v]) => t.replaceAll(k, v), text);
}

function place(src, rel) {
  const dest = join(dir, rel);
  if (existsSync(dest)) {
    const stock = INIT_STOCK[rel];
    if (!stock || !readFileSync(dest, 'utf8').includes(stock)) {
      console.log(`  - ${rel} (exists, kept)`);
      return;
    }
  }
  mkdirSync(dirname(dest), { recursive: true });
  if (TEXT.has(extname(src))) writeFileSync(dest, fill(readFileSync(src, 'utf8')));
  else writeFileSync(dest, readFileSync(src));
  console.log(`  ✓ ${rel}`);
}

function copyTree(from, to = '', keep = () => true) {
  for (const src of walk(from)) {
    const rel = join(to, relative(from, src)).replaceAll('\\', '/');
    if (keep(rel)) place(src, rel);
  }
}

const read = (rel) => (existsSync(join(dir, rel)) ? readFileSync(join(dir, rel), 'utf8') : '');

// A project with its own schema.js already has code the template's modules
// don't know (other tables, other exports): only the infrastructure is added —
// CI, the test harness, docs — and tgcloud/ is left alone.
const fresh = !read('tgcloud/schema.js') || read('tgcloud/schema.js').includes(INIT_STOCK['tgcloud/schema.js']);
const INFRA = /^(\.github\/|test\/sdk\/|test\/helpers\.mjs$)/;

mkdirSync(dir, { recursive: true });
console.log(`tgcloud-kit → ${resolve(dir)}${fresh ? '' : '  (existing project: tgcloud/ is left as it is; only infrastructure is added)'}`);

copyTree(BOT_TEMPLATE, '', (rel) => fresh || INFRA.test(rel));
place(ARCHITECTURE, 'docs/ARCHITECTURE.md');
place(ADMIN_TOOLS, 'docs/ADMIN-TOOLS.md');
place(BOT_API, 'docs/BOT-API.md');

if (miniApp) {
  // The Mini App's endpoint needs the template's lib (lib/feedback.js): a fresh
  // project, or one scaffolded by this kit. The front-end goes in only where
  // there is none yet.
  const kitLib = read('tgcloud/lib/feedback.js').includes('export async function takeFeedbackSlot')
    && read('tgcloud/lib/users.js').includes('export async function profileOf');
  const frontEnd = !fresh && existsSync(join(dir, 'index.html'));
  copyTree(APP_TEMPLATE, '', (rel) => (rel.startsWith('tgcloud/') || rel.startsWith('test/') ? fresh || kitLib : !frontEnd));
  if (!fresh && !kitLib) console.log('  ! Mini App endpoint skipped: tgcloud/lib has no feedback/profileOf — write this project\'s endpoints with the tgcloud-endpoints skill.');
  if (frontEnd) console.log('  - front-end (index.html exists, kept)');
}

// ---------- package.json ----------

const pkgPath = join(dir, 'package.json');
const pkg = existsSync(pkgPath) ? JSON.parse(readFileSync(pkgPath, 'utf8')) : { name: basename(resolve(dir)), private: true };
pkg.type = 'module';
// node:sqlite (npm test) and Vite need Node 22.12+.
pkg.engines = { node: '>=22.12', ...pkg.engines };
// Ours fill the gaps; an existing script is replaced only when it is the one
// `tgcloud init` wrote (the user's own scripts are kept).
const INIT_SCRIPTS = new Set(['tgcloud push', 'npm run build && tgcloud push', 'tgcloud status', 'tgcloud run']);
const scripts = {
  ...(miniApp ? { dev: 'vite', build: 'vite build' } : {}),
  test: 'node --import ./test/sdk/register.mjs --test "test/**/*.test.mjs"',
  login: 'tgcloud login',
  status: 'tgcloud status',
  deploy: miniApp ? 'vite build && tgcloud push' : 'tgcloud push',
  migrate: 'tgcloud migrate',
  run: 'tgcloud run',
  pull: 'tgcloud pull',
  webhook: 'tgcloud webhook',
};
pkg.scripts = { ...pkg.scripts };
for (const [name, command] of Object.entries(scripts)) {
  const current = pkg.scripts[name];
  if (current === undefined || (INIT_SCRIPTS.has(current) && current !== command)) pkg.scripts[name] = command;
  else if (current !== command) console.log(`  - npm script "${name}" (exists, kept)`);
}
pkg.devDependencies = {
  '@tgcloud/cli': '^0.2.0',
  ...(miniApp ? { vite: '^8.3.4', '@vitejs/plugin-react': '^6.1.2' } : {}),
  ...pkg.devDependencies,
};
if (miniApp) pkg.dependencies = { react: '^19.3.1', 'react-dom': '^19.3.1', ...pkg.dependencies };
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`  ✓ package.json (scripts${miniApp ? ', React + Vite' : ''}, @tgcloud/cli)`);

// ---------- tgcloud.jsonc ----------

if (miniApp) {
  const jsonc = join(dir, 'tgcloud.jsonc');
  const json = join(dir, 'tgcloud.json');
  // A live "static" key (not the commented-out stock one) is the user's: keep it.
  const live = (p) => existsSync(p) && /"static"\s*:/.test(readFileSync(p, 'utf8').replace(/^\s*\/\/.*$/gm, ''));
  if (existsSync(json) || live(jsonc)) {
    console.log('  - tgcloud.jsonc ("static" already set, kept)');
  } else {
    writeFileSync(jsonc, `{
  // The Mini App: \`npm run build\` (Vite) writes dist/, push uploads it.
  // Served at https://app<app id>.tgcloud.ai/ — push prints the address.
  "static": {
    "source": "dist",
    "immutable": ["/assets/*"]
  },
  "$schema": "./node_modules/@tgcloud/cli/schema/tgcloud.json"
}
`);
    console.log('  ✓ tgcloud.jsonc ("static": dist)');
  }
}

// ---------- .gitignore ----------

const gitignore = join(dir, '.gitignore');
const ignored = existsSync(gitignore) ? readFileSync(gitignore, 'utf8').split('\n').map((l) => l.trim().replace(/^\/+|\/+$/g, '')) : [];
const missing = ['.tgcloud', 'node_modules', ...(miniApp ? ['dist'] : [])].filter((e) => !ignored.includes(e));
if (missing.length) {
  const text = existsSync(gitignore) ? readFileSync(gitignore, 'utf8') : '';
  appendFileSync(gitignore, (text && !text.endsWith('\n') ? '\n' : '') + missing.map((e) => `${e}/`).join('\n') + '\n');
  console.log(`  ✓ .gitignore (+ ${missing.join(', ')})`);
}

// ---------- AGENTS.md: point every agent at the conventions ----------

const agents = join(dir, 'AGENTS.md');
const MARK = '<!-- tgcloud-kit -->';
const section = `
${MARK}
## Project conventions (tgcloud-kit)

This project was scaffolded with tgcloud-kit. Before changing code, read
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): where each kind of code goes,
naming, the command/test patterns and the deploy pipeline. In short:
handlers and endpoints stay thin and call \`tgcloud/lib/\`; every feature gets a
test in \`test/\` (\`npm test\`, offline); new columns on existing tables are
nullable; pushing to \`main\` deploys.

**Every action has a way back**: every screen a button (inline or reply
keyboard) or command opens has «🔙 بازگشت» to the screen before it, and a
final result has «🏠 منوی اصلی». Add screens to \`tgcloud/lib/menu.js\` with
a \`parent\` (the back button is added automatically); keyboards a feature
builds itself use \`withBack()\`. In the Mini App, every screen but the first
calls \`useBackButton(goBack)\`.

The Bot API (10.4) as this project uses it: [docs/BOT-API.md](docs/BOT-API.md):
which update types exist (one \`handlers/<type>.js\` each), and newer features
such as ephemeral messages, rich messages, streaming drafts and widgets.

Admin-only tools (\`npm run sql\`, admin chat commands, admin Mini App
endpoints, scheduled jobs, secrets) are not built in. Add one only when the
user asks for it, following [docs/ADMIN-TOOLS.md](docs/ADMIN-TOOLS.md).

If the project has a Mini App, its look is in [docs/DESIGN.md](docs/DESIGN.md):
follow it for every front-end change. If the user hasn't chosen a design
system yet, ask: the default (Telegram theme) or their own.
`;
if (!existsSync(agents)) {
  console.log('  ! AGENTS.md not found — run `npx -y @tgcloud/cli@0.2.0 init` first (it writes AGENTS.md and docs/tgcloud-sdk.md), then re-run this script.');
} else if (!readFileSync(agents, 'utf8').includes(MARK)) {
  appendFileSync(agents, section);
  console.log('  ✓ AGENTS.md (+ project conventions)');
}

// ---------- .claude/settings.json: the kit, enabled for the project ----------

if (!flag('--no-claude-settings')) {
  const settingsPath = join(dir, '.claude', 'settings.json');
  const settings = existsSync(settingsPath) ? JSON.parse(readFileSync(settingsPath, 'utf8')) : {};
  settings.extraKnownMarketplaces = {
    [MARKETPLACE.name]: { source: { source: 'github', repo: MARKETPLACE.repo } },
    ...settings.extraKnownMarketplaces,
  };
  settings.enabledPlugins = { [`tgcloud-kit@${MARKETPLACE.name}`]: true, ...settings.enabledPlugins };
  mkdirSync(dirname(settingsPath), { recursive: true });
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  console.log('  ✓ .claude/settings.json (tgcloud-kit plugin enabled for this project)');
}

console.log(`
Next:
  npm install
  npm test                 # offline tests on the mock SDK
  npx tgcloud login        # link to the bot (interactive: BotFather → bot → Serverless → CLI Access)
  npm run deploy           # push the code${miniApp ? ' (and the built Mini App)' : ''}
  npx tgcloud migrate      # create the tables
  then send /start to the bot from the admin account, and set the command list
  in @BotFather → /setcommands:  start - شروع   help - راهنما
  Admin tools (npm run sql, /stats, an admin panel…) are not included: ask your
  AI agent to add the ones you need.`);
