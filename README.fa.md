<div align="center">

# tgcloud-kit: Telegram serverless bots with AI agents

[![GitHub stars](https://img.shields.io/github/stars/IsAmirMmd/nim-byte-telegram-serverless?style=for-the-badge&logo=github&color=f5c518)](https://github.com/IsAmirMmd/nim-byte-telegram-serverless/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/IsAmirMmd/nim-byte-telegram-serverless?style=for-the-badge&logo=github)](https://github.com/IsAmirMmd/nim-byte-telegram-serverless/network/members)
[![License: MIT](https://img.shields.io/github/license/IsAmirMmd/nim-byte-telegram-serverless?style=for-the-badge&color=blue)](LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/IsAmirMmd/nim-byte-telegram-serverless?style=for-the-badge)](https://github.com/IsAmirMmd/nim-byte-telegram-serverless/commits/main)

[English](README.md) · **فارسی**

</div>

<div dir="rtl">

**با یک جمله به ایجنت هوش مصنوعی، ربات سرورلس تلگرام خودت رو بساز و بالا بیار.**

این مخزن مجموعه‌ای از **اسکیل‌ها**، یک **اسکفولد تست‌شده** و یک **راهنمای کامل** است. این‌ها به ایجنت‌هایی مثل Claude Code، Codex، Cursor، Gemini CLI و GitHub Copilot یاد می‌دهند یک ربات روی [Telegram Serverless](https://core.telegram.org/bots/serverless) را از صفر بسازند، تست کنند و دیپلوی کنند. سرور و دیتابیس جدا لازم نیست: کد روی سرورهای خود تلگرام اجرا می‌شود، دیتابیس SQLite داخلی است و مینی‌اپ هم کنار ربات میزبانی می‌شود.

📖 **سایت راهنما:** https://isamirmmd.github.io/nim-byte-telegram-serverless/

🤖 **پیش‌نمایش زنده:** [@tgCloudKit_bot](https://t.me/tgCloudKit_bot). رباتی که کیت در همین لحظه می‌سازد (همراه با مینی‌اپ). با هر تغییر کیت، از نو ساخته و دیپلوی می‌شود.

## داخلش چیست

| اسکیل | کارش |
|---|---|
| **tgcloud-bot** (نقطه‌ی شروع) | یک پوشه‌ی خالی را به یک ربات کامل تبدیل می‌کند: ساختار `tgcloud/` (schema، یک lib برای هر ویژگی، handler و endpoint سبک)، ثبت کاربران، `/stop` و تشخیص بلاک، منوی `/start` که همه‌ی صفحه‌هایش (چه دکمه‌ی شیشه‌ای، چه کیبورد) دکمه‌ی «🔙 بازگشت» دارند، دیپ‌لینک، سؤال‌وجواب چندمرحله‌ای، ارسال نظر به ادمین، تست آفلاین با SDK شبیه‌سازی‌شده و دیپلوی خودکار با GitHub Actions. ربات‌ها **به‌طور پیش‌فرض انگلیسی و فارسی هم** حرف می‌زنند و کاربر با دکمه‌ی 🌐 زبانش را عوض می‌کند |
| **tgcloud-endpoints** | مرجع کامل endpointهای مینی‌اپ (`POST /api/<name>`): احراز هویت با `ctx.initData`، خطا، صفحه‌بندی، جستجو، محدودیت درخواست و تست |
| **tgcloud-mini-app** | مینی‌اپ React + Vite، همراه با تنظیم `tgcloud.jsonc` و دیپلوی. مثل ربات دو زبانه است و در فارسی راست‌به‌چپ می‌شود. موقع راه‌اندازی، ایجنت می‌پرسد با کدام دیزاین سیستم کار کنید: **پیش‌فرض** (رنگ‌های تم خود تلگرام) یا **دیزاین سیستم خودتان** (لینک سایت یا فیگما، فایل CSS، یک اسکیل دیزاین، کتابخانه‌ای مثل Tailwind یا یک توضیح ساده). انتخاب شما در `docs/DESIGN.md` ربات ذخیره می‌شود |
| **tgcloud-widgets** | ویجت‌های HTML داخل پیام (Bot API 10.4): بلوک‌های کوچک و تعاملی مثل شمارنده، نظرسنجی زنده، قیمت لحظه‌ای یا یک بازی کوچک. شامل `sendWidget`، هندلر `widget_query`، وضعیت ویجت، پرداخت با کیف پول TON و یک نمونه‌ی تست‌شده |

`scripts/create-bot.mjs` هم همه‌ی مراحل ساخت را با یک دستور انجام می‌دهد، حتی بدون هوش مصنوعی.

## پیش‌نیازها

1. **Node.js 22.12** یا جدیدتر.
2. **دسترسی به Serverless.** این قابلیت هنوز برای همه فعال نشده و اول باید درخواست بدهید: مینی‌اپ [@BotFather](https://t.me/BotFather) را باز کنید، یک ربات جدید بسازید، وارد بخش **Serverless** همان ربات شوید و از آنجا درخواست بدهید. وقتی BotFather پیام داد که وایت‌لیست شما باز شده، می‌توانید از آن استفاده کنید.
3. بعد از باز شدن دسترسی، در BotFather: ربات ← **Serverless** ← **CLI Access ← Access token** را کپی کنید (شکلش `app<id>:<secret>` است و با توکن معمولی ربات فرق دارد).
4. **آیدی عددی** تلگرام خودتان از [@userinfobot](https://t.me/userinfobot).

## استفاده با ایجنت‌های هوش مصنوعی

### Claude Code، به‌صورت پلاگین (یک بار برای همه‌ی پروژه‌ها)

</div>

```
/plugin marketplace add IsAmirMmd/nim-byte-telegram-serverless
/plugin install tgcloud-kit@nim-byte
```

<div dir="rtl">

یا از ترمینال:

</div>

```bash
claude plugin marketplace add IsAmirMmd/nim-byte-telegram-serverless
```

```bash
claude plugin install tgcloud-kit@nim-byte --scope user
```

<div dir="rtl">

بعد در یک پوشه‌ی خالی Claude Code را باز کنید و بنویسید:

</div>

```
/tgcloud-kit:tgcloud-bot 123456789 یه ربات ثبت سفارش کافه با مینی‌اپ
```

<div dir="rtl">

به‌روزرسانی: `claude plugin update tgcloud-kit@nim-byte`.

### Claude Code، با کلون کردن همین مخزن

اسکیل‌ها در `.claude/skills/` هستند و با باز کردن مخزن خودکار شناخته می‌شوند:

</div>

```bash
git clone https://github.com/IsAmirMmd/nim-byte-telegram-serverless
cd nim-byte-telegram-serverless
claude
```

```
/tgcloud-bot 123456789 یه ربات نوبت‌دهی آرایشگاه با مینی‌اپ
```

<div dir="rtl">

ربات در یک پوشه‌ی جدا کنار این مخزن ساخته می‌شود (مثلاً `../barber-bot`)، چون خودش یک مخزن گیت جداست.

### Codex، Cursor، Gemini CLI، GitHub Copilot و بقیه

هر ایجنتی که بتواند فایل بخواند و دستور اجرا کند کافی است. مخزن را کلون کنید، ایجنت را داخلش باز کنید و بگویید:

</div>

```
فایل AGENTS.md رو بخون و طبقش برام یه ربات سرورلس تلگرام بساز که سفارش غذا بگیره و پنل مینی‌اپ داشته باشه. آیدی عددی من 123456789 است.
```

<div dir="rtl">

`AGENTS.md` به ایجنت می‌گوید کدام اسکیل را بخواند، ربات را کجا بسازد و چه کارهایی را فقط با اجازه‌ی شما انجام دهد. Codex و Cursor و Copilot این فایل را خودشان می‌خوانند. برای Gemini CLI همان جمله‌ی بالا کافی است.

### بدون هوش مصنوعی

یک دستور، بدون نیاز به کلون: `tgcloud init`، اسکفولد، نصب و اجرای تست‌ها.

</div>

```bash
npx github:IsAmirMmd/nim-byte-telegram-serverless my-bot --admin 123456789 --mini-app
```

<div dir="rtl">

یا از داخل مخزن کلون‌شده:

</div>

```bash
node scripts/create-bot.mjs ../my-bot --admin 123456789 --mini-app
```

<div dir="rtl">

بدون `--mini-app` فقط خود ربات ساخته می‌شود. `--help` همه‌ی گزینه‌ها را نشان می‌دهد.

## راه‌اندازی ربات بعد از ساخته شدن پروژه

همه‌ی دستورها در **پوشه‌ی ربات** اجرا می‌شوند.

۱. **اتصال به ربات.** توکن CLI را همین‌جا وارد کنید و هیچ‌وقت در چت برای ایجنت نفرستید. در Claude Code می‌توانید بنویسید `! npx tgcloud login`.

</div>

```bash
npx tgcloud login
```

<div dir="rtl">

۲. **دیپلوی و ساخت جدول‌ها.** دیپلوی هیچ‌وقت خودش به دیتابیس دست نمی‌زند و تغییرات schema با `migrate` اعمال می‌شوند.

</div>

```bash
npm run deploy
```

```bash
npx tgcloud migrate
```

<div dir="rtl">

۳. **امتحان در تلگرام.** به ربات `/start` بدهید. ربات خودش لیست دستورها (انگلیسی و فارسی) و دکمه‌ی مینی‌اپ کنار ورودی پیام را تنظیم می‌کند و در BotFather کاری لازم نیست. اگر مینی‌اپ دارید، آدرسی را که `push` چاپ کرد (`https://app<id>.tgcloud.ai/`) در `MINI_APP_URL` فایل `tgcloud/lib/config.js` بگذارید و دوباره دیپلوی کنید.

۴. **دیپلوی خودکار.** پوشه‌ی ربات را در یک مخزن جدا در گیت‌هاب بگذارید و سکرت **`TGCLOUD_TOKEN`** را اضافه کنید (Settings ← Secrets and variables ← Actions). از آن به بعد هر push به `main` به ترتیب build، push، `migrate --safe` و `webhook sync` را انجام می‌دهد.

۵. **ادامه‌ی ساخت.** پوشه‌ی ربات را در ایجنت باز کنید و ویژگی بخواهید. `AGENTS.md` و `docs/ARCHITECTURE.md` همان پوشه به هر ایجنتی می‌گویند کد کجا برود و چطور تست شود.

## دستورهای اجرای ربات

| دستور | کارش |
|---|---|
| `npm install` | نصب وابستگی‌ها (یک بار) |
| `npm test` | تست‌های آفلاین روی SDK شبیه‌سازی‌شده؛ بدون شبکه و بدون دیپلوی |
| `npx tgcloud login` | اتصال پروژه به ربات با توکن CLI (یک بار) |
| `npm run deploy` | بیلد مینی‌اپ (اگر هست) و آپلود کد |
| `npx tgcloud migrate` | اعمال تغییرات `tgcloud/schema.js` روی دیتابیس |
| `npx tgcloud status` | چه چیزی محلی تغییر کرده و هنوز روی ابر نیست |
| `npx tgcloud run <module> '<input>'` | اجرای یک handler یا endpoint روی ابر با دیتابیس و Bot API واقعی، بدون دیپلوی |
| `npx tgcloud webhook` | وضعیت وب‌هوک؛ با `npx tgcloud webhook sync` درست می‌شود |
| `npx tgcloud pull` | هم‌سان کردن پروژه‌ی محلی با چیزی که روی ابر است |
| `npm run dev` | اجرای مینی‌اپ در مرورگر (فراخوانی endpointها فقط داخل تلگرام کار می‌کند) |
| `npm run build` | بیلد مینی‌اپ در `dist/` |

نمونه‌ی `tgcloud run`:

</div>

```bash
npx tgcloud run handlers/message '{ text: "/start", from: { id: 123456789 }, chat: { id: 123456789, type: "private" } }'
```

```bash
npx tgcloud run endpoints/me '{}' --ctx '{ initData: { user: { id: 123456789 } } }'
```

<div dir="rtl">

## زبان‌ها

ربات‌هایی که با کیت ساخته می‌شوند **به‌طور پیش‌فرض انگلیسی و فارسی هم** حرف می‌زنند. همه‌ی متن‌های کاربر در `tgcloud/lib/i18n.js` ربات به هر دو زبان هستند و مینی‌اپ هم همین دیکشنری‌ها را در `src/lib/i18n.js` دارد. زبان هر کاربر به این ترتیب تعیین می‌شود:
1. زبانی که با دکمه‌ی 🌐 ربات انتخاب کرده؛
2. اگر انتخاب نکرده، زبان اپ تلگرامش (برای `fa` فارسی)؛
3. در غیر این صورت انگلیسی.

مینی‌اپ هم همین انتخاب را دنبال می‌کند و در فارسی راست‌به‌چپ می‌شود. برای زبان سوم، از ایجنت بخواهید یک دیکشنری اضافه کند. سایت راهنما هم دو زبانه است: انگلیسی به‌طور پیش‌فرض و فارسی با یک کلیک.

## ابزار ادمین، فقط وقتی بخواهید

قالب ربات **هیچ مسیر یا دستور ادمینی ندارد**: نه `/api/sql`، نه `/stats` و `/backup`، نه پنل ادمین و نه کار زمان‌بندی‌شده. این ابزارها قدرتمندند، پس هر ربات فقط همان‌هایی را می‌گیرد که صاحبش بخواهد. کافی است به ایجنت بگویید. روش امن ساخت هرکدام در `docs/ADMIN-TOOLS.md` هر ربات (و در [`admin-tools.md`](tgcloud-kit/skills/tgcloud-bot/references/admin-tools.md)) آمده است: بررسی `requireAdmin` در خط اول، تست برای کاربر غیرمجاز و گزارش خطا به ادمین.

| به ایجنت بگویید | چه اضافه می‌شود |
|---|---|
| «برام `npm run sql` رو اضافه کن» | یک endpoint فقط‌ادمین و یک اسکریپت ترمینال برای کوئری مستقیم دیتابیس |
| «دستورهای `/stats` و `/backup` برای ادمین بساز» | آمار کاربران و بکاپ CSV در چت ادمین، با گزارش خطا |
| «یه پنل ادمین در مینی‌اپ با لیست کاربران بساز» | endpointهای ادمین با `requireAdmin` و جدول صفحه‌بندی‌شده |
| «هر روز ساعت ۹ صبح گزارش بفرست» | یک دستور ادمین و یک کار زمان‌بندی‌شده در GitHub Actions |
| «کلید API فلان سرویس رو ذخیره کن» | دستور `/setkey` که کلید را در جدول `settings` نگه می‌دارد |

بعد از اضافه شدن `npm run sql`:

</div>

```bash
npm run sql -- "SELECT * FROM users ORDER BY first_seen_at DESC LIMIT 5"
```

```bash
npm run sql -- "SELECT name FROM sqlite_master WHERE type = 'table'"
```

<div dir="rtl">

دور کوئری دابل‌کوتیشن و دور مقدارها سینگل‌کوتیشن بگذارید. نوشتن (UPDATE و DELETE) واقعی و بی‌بازگشت است، پس اول با همان WHERE یک SELECT بگیرید.

## امنیت

- **بدون مسیر ادمین پیش‌فرض.** ربات تازه فقط `me` را باز می‌کند (و با مینی‌اپ، `feedback` را که محدودیت درخواست دارد).
- **توکن CLI** فقط در `.tgcloud/` (داخل gitignore) و سکرت `TGCLOUD_TOKEN` گیت‌هاب می‌ماند؛ نه در کد، نه در مستندات، نه در چت با ایجنت.
- **هویت فقط از تلگرام.** endpointها کاربر را فقط از `ctx.initData.user` که پلتفرم تأییدش کرده می‌شناسند. هر کاربر مینی‌اپ می‌تواند هر endpointی را صدا بزند، پس ورودی‌ها اعتبارسنجی و درخواست‌ها محدود می‌شوند.
- **سکرت‌ها** (کلیدهای API) در جدول `settings` می‌مانند و هیچ‌وقت در بکاپ یا خروجی نمی‌آیند.

## ساختار مخزن

</div>

```
nim-byte-telegram-serverless/
├─ tgcloud-kit/                     ← the Claude Code plugin
│  ├─ .claude-plugin/plugin.json
│  └─ skills/
│     ├─ tgcloud-bot/               ← SKILL.md, references/ (architecture, patterns, admin-tools, bot-api),
│     │                               scripts/scaffold.mjs, assets/template/
│     ├─ tgcloud-endpoints/         ← SKILL.md
│     ├─ tgcloud-mini-app/          ← SKILL.md, references/recipes.md, assets/app/ (React starter)
│     └─ tgcloud-widgets/           ← SKILL.md, references/widget-runtime.md, scripts/widgets.mjs, assets/example/
├─ .claude-plugin/marketplace.json  ← makes this repo a plugin marketplace ("nim-byte")
├─ .claude/skills/                  ← pointers: the skills work when the repo is cloned
├─ AGENTS.md, CLAUDE.md             ← instructions for any AI agent
├─ scripts/create-bot.mjs           ← one command: init + scaffold + install + tests
├─ site/                            ← the guide site (React + Vite, en + fa)
└─ .github/workflows/
   ├─ pages.yml                     ← deploys site/ to GitHub Pages
   ├─ kit.yml                       ← creates a bot from the kit and runs its tests
   └─ preview.yml                   ← deploys the kit's bot to @tgCloudKit_bot (live preview)
```

<div dir="rtl">

رباتی که ساخته می‌شود این ساختار را دارد:

</div>

```
my-bot/
├─ tgcloud/            ← schema.js, handlers/, endpoints/, lib/ (the code Telegram runs; texts in lib/i18n.js)
├─ src/, index.html    ← the Mini App (with --mini-app)
├─ test/               ← offline tests on a mock SDK
├─ docs/               ← ARCHITECTURE.md, ADMIN-TOOLS.md, BOT-API.md, tgcloud-sdk.md
├─ .github/workflows/deploy.yml
├─ AGENTS.md
└─ tgcloud.jsonc
```

<div dir="rtl">

## سایت راهنما

سایت در `site/` با React و Vite ساخته شده و بک‌اند ندارد. با هر push به `main` که `site/` را تغییر دهد، workflow ‏`pages.yml` آن را روی GitHub Pages منتشر می‌کند.

- **یک بار تنظیم:** Settings ← Pages ← Build and deployment ← Source: **GitHub Actions**. بعد از Actions، workflow ‏«Deploy site» را اجرا کنید.
- **اجرای محلی:**

</div>

```bash
npm --prefix site install
```

```bash
npm --prefix site run dev
```

<div dir="rtl">

متن‌های سایت (انگلیسی و فارسی) در `site/src/content.js` هستند. در فورک‌ها هم همین تنظیم Pages کافی است، چون سایت با مسیر نسبی ساخته می‌شود.

## پیش‌نمایش زنده

[@tgCloudKit_bot](https://t.me/tgCloudKit_bot) همان رباتی است که `scripts/create-bot.mjs --mini-app` می‌سازد. با هر push به `main` که کیت را تغییر دهد، workflow ‏`preview.yml` این کارها را انجام می‌دهد:
1. یک ربات تازه از کیت می‌سازد و تست‌هایش را اجرا می‌کند. اگر تستی رد شود، دیپلوی انجام نمی‌شود.
2. مینی‌اپ را بیلد می‌کند.
3. ربات را با `push`، ‏`migrate --safe` و `webhook sync` دیپلوی می‌کند و بررسی می‌کند که ابر دقیقاً همان کد را اجرا کند.

توکن و آیدی ادمین فقط در environment ‏`preview` مخزن نگه داشته می‌شوند (secret ‏`PREVIEW_TGCLOUD_TOKEN` و variable ‏`PREVIEW_ADMIN_ID`) و این environment فقط به برنچ `main` دسترسی دارد. فورک‌ها به آن‌ها دسترسی ندارند: secretها در فورک کپی نمی‌شوند، این workflow بیرون از همین مخزن اجرا نمی‌شود و برای pull request هم اجرا نمی‌شود.

## لایسنس

[MIT](LICENSE). استفاده، تغییر، فورک و انتشار آزاد است، چه شخصی و چه تجاری. فقط متن لایسنس و نام سازنده را در کپی‌ها نگه دارید.

</div>
