// Every text on the site, in English (the default) and Persian.
// Inline `code` and **bold** are supported in strings (see Rich in App.jsx).

export const REPO = 'IsAmirMmd/nim-byte-telegram-serverless';
export const REPO_URL = `https://github.com/${REPO}`;
export const PREVIEW_URL = 'https://t.me/tgCloudKit_bot';
export const CLONE = `git clone https://github.com/${REPO}\ncd nim-byte-telegram-serverless`;

const PLUGIN = `/plugin marketplace add ${REPO}\n/plugin install tgcloud-kit@nim-byte`;

export const content = {
  fa: {
    lang: 'fa',
    dir: 'rtl',
    title: 'tgcloud-kit · ربات سرورلس تلگرام با ایجنت‌های هوش مصنوعی',
    switchLabel: 'English',
    themeLabel: 'تغییر تم',
    copy: 'کپی',
    copied: 'کپی شد',
    nav: [
      { id: 'how', label: 'چطور کار می‌کند' },
      { id: 'skills', label: 'اسکیل‌ها' },
      { id: 'start', label: 'شروع' },
      { id: 'commands', label: 'دستورها' },
      { id: 'admin', label: 'ابزار ادمین' },
      { id: 'faq', label: 'سؤال‌ها' },
    ],

    hero: {
      eyebrow: 'Telegram Serverless · AI Agents',
      title: 'ربات تلگرامت رو با یک جمله به ایجنت هوش مصنوعی بساز',
      lead: 'tgcloud-kit مجموعه‌ای از اسکیل‌ها، یک اسکفولد تست‌شده و یک راهنمای کامله که به ایجنت‌هایی مثل Claude Code، Codex، Cursor، Gemini CLI و Copilot یاد می‌ده یک ربات سرورلس تلگرام رو از صفر بسازن، تست کنن و بالا بیارن. نه سرور لازم داری، نه دیتابیس جدا.',
      primary: 'شروع سریع',
      secondary: 'مخزن در گیت‌هاب',
      preview: 'امتحان ربات نمونه',
      chat: {
        you: 'شما',
        agent: 'ایجنت',
        bot: 'ربات شما',
        prompt: 'یه ربات نوبت‌دهی برای آرایشگاه با مینی‌اپ بساز. آیدی من ۱۲۳۴۵۶۷۸۹ است.',
        steps: [
          'اسکیل tgcloud-bot رو خوندم',
          'پروژه ساخته شد: schema، handlers، endpoints',
          '۱۵ تست آفلاین سبز شد ✓',
          'npx tgcloud login رو خودت بزن؛ بقیه‌اش با من',
        ],
        botReply: 'سلام 👋 چه کاری برات انجام بدم؟',
        buttons: ['📱 باز کردن اپ', '📖 راهنما'],
      },
    },

    how: {
      title: 'چطور کار می‌کند',
      lead: 'Telegram Serverless کد جاوااسکریپت ربات رو روی سرورهای خود تلگرام اجرا می‌کنه: دیتابیس SQLite داخلیه، وب‌هوک خودکار تنظیم می‌شه و مینی‌اپ هم کنار ربات میزبانی می‌شه. این کیت قوانین این پلتفرم و یک معماری امتحان‌پس‌داده رو به ایجنت شما یاد می‌ده.',
      steps: [
        { icon: '💬', title: 'شما می‌گید چی می‌خواید', body: 'به زبان ساده: «یه ربات فروشگاه با سبد خرید و پنل مینی‌اپ». به‌علاوه‌ی آیدی عددی تلگرامتون.' },
        { icon: '🧠', title: 'ایجنت با اسکیل‌ها می‌سازه', body: 'ساختار پروژه، دیتابیس، هندلرها، اندپوینت‌ها و تست‌ها طبق معماری کیت ساخته می‌شن و قبل از هر تغییری تست‌ها اجرا می‌شن.' },
        { icon: '🚀', title: 'ربات روی تلگرام بالا میاد', body: 'شما فقط یک بار لاگین می‌کنید. از اون به بعد هر push به main با GitHub Actions خودکار دیپلوی می‌شه.' },
      ],
    },

    skills: {
      title: 'اسکیل‌ها',
      lead: 'چهار اسکیل که هر ایجنتی می‌تونه بخونه. در Claude Code به‌صورت پلاگین نصب می‌شن؛ بقیه‌ی ایجنت‌ها از طریق `AGENTS.md` بهشون می‌رسن.',
      items: [
        {
          name: 'tgcloud-bot',
          tag: 'نقطه‌ی شروع',
          body: 'یک پوشه‌ی خالی رو به یک ربات کامل تبدیل می‌کنه و بعد ویژگی‌ها رو روی همون معماری می‌سازه.',
          points: ['ثبت کاربران، `/stop` و تشخیص بلاک', 'منوی `/start`، دیپ‌لینک و سؤال‌وجواب چندمرحله‌ای', 'دکمه‌ی بازگشت در همه‌ی صفحه‌ها، چه دکمه‌ی شیشه‌ای چه کیبورد', 'دو زبانه: انگلیسی (پیش‌فرض) و فارسی', 'ارسال نظر کاربر به ادمین', 'تست آفلاین با SDK شبیه‌سازی‌شده', 'دیپلوی خودکار با GitHub Actions'],
        },
        {
          name: 'tgcloud-endpoints',
          tag: 'سمت سرور مینی‌اپ',
          body: 'مرجع کامل نوشتن `POST /api/<name>` برای مینی‌اپ، بدون نیاز به خوندن دوباره‌ی مستندات رسمی.',
          points: ['احراز هویت با `ctx.initData` تأییدشده', 'خطاها با `EndpointError`', 'صفحه‌بندی، جستجو و فیلتر امن', 'محدودیت درخواست برای هر کاربر', 'تست با `tgcloud run`'],
        },
        {
          name: 'tgcloud-mini-app',
          tag: 'فرانت‌اند',
          body: 'مینی‌اپ React + Vite که رنگ‌هاش رو از تم خود تلگرام می‌گیره و کنار ربات روی `app<id>.tgcloud.ai` میزبانی می‌شه.',
          points: ['انتخاب دیزاین سیستم: پیش‌فرض (تم تلگرام) یا دیزاین خودت', 'استارتر آماده: پروفایل و فرم ارسال نظر', 'تمام‌صفحه، safe area و تم روشن/تاریک', 'هوک `useEndpoint` و `callEndpoint`', 'تنظیم `tgcloud.jsonc` و دیپلوی'],
        },
        {
          name: 'tgcloud-widgets',
          tag: 'Bot API 10.4',
          body: 'ویجت‌های HTML داخل خود پیام: بلوک‌های کوچک و تعاملی که توی چت می‌مونن، مثل شمارنده، نظرسنجی زنده یا یک بازی کوچک.',
          points: ['`sendWidget` و هندلر `widget_query`', 'وضعیت ویجت که فقط ربات می‌نویسه', 'بررسی حجم (حداکثر ۴ کیلوبایت فشرده)', 'پرداخت با کیف پول TON', 'نمونه‌ی شمارنده با تست'],
        },
      ],
    },

    start: {
      title: 'شروع',
      lead: 'وقتی دسترسی سرورلس باز شد، از هیچ تا رباتی که روی تلگرام جواب می‌ده معمولاً کمتر از نیم ساعت طول می‌کشه.',
      needTitle: 'قبل از شروع لازم داری',
      needs: [
        '**Node.js 22.12** یا جدیدتر',
        'یک ربات از **@BotFather** (`/newbot`)',
        'دسترسی به **Serverless**: هنوز برای همه باز نیست؛ از مینی‌اپ BotFather درخواست بده (توضیحش در «سؤال‌ها»)',
        'بعد از باز شدن دسترسی، در BotFather: ربات ← **Serverless** ← **CLI Access ← Access token**',
        '**آیدی عددی** تلگرام خودت از **@userinfobot**',
        'یک ایجنت هوش مصنوعی (یا فقط ترمینال)',
      ],
      tabsTitle: 'ایجنتت رو انتخاب کن',
      tabs: [
        {
          id: 'plugin',
          label: 'Claude Code · پلاگین',
          intro: 'یک بار نصب کن، در همه‌ی پروژه‌ها در دسترسه:',
          code: PLUGIN,
          after: 'بعد در یک پوشه‌ی خالی Claude Code رو باز کن و بنویس:',
          prompt: '/tgcloud-kit:tgcloud-bot 123456789 یه ربات ثبت سفارش کافه با مینی‌اپ',
        },
        {
          id: 'clone',
          label: 'Claude Code · کلون',
          intro: 'مخزن رو کلون کن و Claude Code رو داخلش باز کن؛ اسکیل‌ها خودکار شناخته می‌شن:',
          code: `${CLONE}\nclaude`,
          after: 'بعد بنویس (ربات در پوشه‌ی جدا، کنار این مخزن ساخته می‌شه):',
          prompt: '/tgcloud-bot 123456789 یه ربات نوبت‌دهی آرایشگاه با مینی‌اپ',
        },
        {
          id: 'others',
          label: 'Codex · Cursor · Gemini · Copilot',
          intro: 'هر ایجنتی که فایل بخونه و دستور اجرا کنه کافیه. مخزن رو کلون کن و ایجنت رو داخلش باز کن:',
          code: `${CLONE}\ncodex          # یا: cursor .  /  gemini  /  code .`,
          after: 'و بنویس:',
          prompt: 'فایل AGENTS.md رو بخون و طبقش برام یه ربات سرورلس تلگرام بساز که سفارش غذا بگیره و پنل مینی‌اپ داشته باشه. آیدی عددی من 123456789 است.',
        },
        {
          id: 'manual',
          label: 'بدون هوش مصنوعی',
          intro: 'یک دستور: init، اسکفولد، نصب و اجرای تست‌ها. بدون نیاز به کلون:',
          code: 'npx github:IsAmirMmd/nim-byte-telegram-serverless my-bot --admin 123456789 --mini-app',
          after: 'یا از داخل مخزن کلون‌شده:',
          prompt: 'node scripts/create-bot.mjs ../my-bot --admin 123456789 --mini-app',
          promptIsCode: true,
        },
      ],
      stepsTitle: 'بعد از ساخته شدن پروژه',
      steps: [
        { title: 'اتصال به ربات', body: 'در پوشه‌ی ربات اجرا کن و توکن CLI رو همون‌جا وارد کن. توکن رو هیچ‌وقت در چت با ایجنت نفرست. در Claude Code می‌تونی بنویسی `! npx tgcloud login`.', code: 'npx tgcloud login' },
        { title: 'دیپلوی و ساخت جدول‌ها', body: '`deploy` کد (و مینی‌اپ ساخته‌شده) رو آپلود می‌کنه؛ `migrate` تغییرات دیتابیس رو اعمال می‌کنه. دیپلوی هیچ‌وقت خودش به دیتابیس دست نمی‌زنه.', code: 'npm run deploy\nnpx tgcloud migrate' },
        { title: 'امتحان در تلگرام', body: 'از حساب ادمین به رباتت `/start` بده. همین کار لیست دستورها رو به انگلیسی و فارسی تنظیم می‌کنه. اگر مینی‌اپ داری، آدرسی که `push` چاپ کرد رو در BotFather و در `MINI_APP_URL` فایل `tgcloud/lib/config.js` بذار.' },
        { title: 'دیپلوی خودکار', body: 'پوشه‌ی ربات رو در یک مخزن جدا در گیت‌هاب بذار و سکرت **`TGCLOUD_TOKEN`** رو اضافه کن (Settings ← Secrets and variables ← Actions). از اون به بعد هر push به `main` بیلد، دیپلوی، migrate و webhook sync رو خودش انجام می‌ده.' },
        { title: 'ادامه‌ی ساخت با ایجنت', body: 'پوشه‌ی ربات رو در ایجنتت باز کن و ویژگی بخواه. `AGENTS.md` و `docs/ARCHITECTURE.md` همون پوشه به هر ایجنتی می‌گن کد کجا بره و چطور تست بشه.' },
      ],
    },

    prompts: {
      title: 'چند نمونه درخواست',
      lead: 'هرچی دقیق‌تر بگی، نتیجه بهتره. این‌ها رو می‌تونی کپی کنی:',
      items: [
        'یه ربات سرورلس بساز که کاربرا توش نوبت آرایشگاه رزرو کنن و ادمین نوبت‌های روز رو ببینه.',
        'به رباتم یه مینی‌اپ اضافه کن که منوی کافه رو با عکس و قیمت نشون بده و سفارش ثبت کنه.',
        'یه دکمه‌ی «دعوت از دوستان» با لینک اختصاصی بساز و تعداد دعوت‌های هر نفر رو نگه دار.',
        'متن‌های ربات رو انگلیسی کن و یک دستور /lang برای تغییر زبان اضافه کن.',
      ],
    },

    commands: {
      title: 'دستورهای اجرای ربات',
      lead: 'همه در پوشه‌ی ربات اجرا می‌شن. CLI به‌صورت dev-dependency نصبه، پس با `npx` یا `npm run` صداش بزن.',
      head: ['دستور', 'کارش'],
      rows: [
        ['npm install', 'نصب وابستگی‌ها (یک بار)'],
        ['npm test', 'تست‌های آفلاین روی SDK شبیه‌سازی‌شده؛ بدون شبکه و بدون دیپلوی'],
        ['npx tgcloud login', 'اتصال پروژه به ربات با توکن CLI (یک بار)'],
        ['npm run deploy', 'بیلد مینی‌اپ (اگر هست) و آپلود کد'],
        ['npx tgcloud migrate', 'اعمال تغییرات `tgcloud/schema.js` روی دیتابیس'],
        ['npx tgcloud status', 'چه چیزی محلی تغییر کرده و هنوز روی ابر نیست'],
        ["npx tgcloud run handlers/message '{ text: \"/start\", from: { id: 1 }, chat: { id: 1, type: \"private\" } }'", 'اجرای یک هندلر روی ابر با دیتابیس و Bot API واقعی، بدون دیپلوی'],
        ["npx tgcloud run endpoints/me '{}' --ctx '{ initData: { user: { id: 1 } } }'", 'اجرای یک اندپوینت روی ابر'],
        ['npx tgcloud webhook', 'وضعیت وب‌هوک؛ با `webhook sync` درستش کن'],
        ['npx tgcloud pull', 'هم‌سان کردن پروژه‌ی محلی با چیزی که روی ابره'],
        ['npm run dev', 'اجرای مینی‌اپ در مرورگر (فراخوانی اندپوینت فقط داخل تلگرام کار می‌کنه)'],
      ],
    },

    admin: {
      title: 'ابزار ادمین، فقط وقتی بخوای',
      lead: 'قالب ربات هیچ مسیر یا دستور ادمینی نداره: نه `/api/sql`، نه `/stats` و `/backup`، نه پنل ادمین. این‌ها قدرتمندن، پس هر ربات فقط همون‌هایی رو می‌گیره که صاحبش بخواد. کافیه به ایجنت بگی؛ دستورالعمل امن ساختشون در `docs/ADMIN-TOOLS.md` هر ربات هست.',
      items: [
        { ask: 'برام npm run sql رو اضافه کن', gets: 'یک اندپوینت فقط‌ادمین و اسکریپت ترمینال برای کوئری مستقیم دیتابیس' },
        { ask: 'دستورهای /stats و /backup برای ادمین بساز', gets: 'آمار کاربران و بکاپ CSV در چت ادمین، با گزارش خطا' },
        { ask: 'یه پنل ادمین در مینی‌اپ با لیست کاربران بساز', gets: 'اندپوینت‌های ادمین با `requireAdmin` و جدول صفحه‌بندی‌شده' },
        { ask: 'هر روز ساعت ۹ صبح گزارش بفرست', gets: 'یک دستور ادمین به‌علاوه‌ی کار زمان‌بندی‌شده در GitHub Actions' },
      ],
      sqlTitle: 'بعد از اضافه شدن `npm run sql`:',
      sqlCode: 'npm run sql -- "SELECT * FROM users ORDER BY first_seen_at DESC LIMIT 5"\nnpm run sql -- "SELECT name FROM sqlite_master WHERE type = \'table\'"',
      sqlNote: 'دور کوئری دابل‌کوتیشن و دور مقدارها سینگل‌کوتیشن بذار. نوشتن (UPDATE/DELETE) واقعی و بدون برگشته؛ اول با همون WHERE یک SELECT بگیر.',
    },

    structure: {
      title: 'رباتی که ساخته می‌شه',
      lead: 'لایه‌ها جدا و نازکن: هندلرها و اندپوینت‌ها فقط مسیر می‌دن، منطق در `lib/` است و هر ویژگی تست خودش رو داره.',
    },

    security: {
      title: 'امنیت',
      items: [
        { title: 'بدون مسیر ادمین پیش‌فرض', body: 'ربات تازه فقط `me` (و با مینی‌اپ `feedback`) رو باز می‌کنه. هر ابزار ادمین با درخواست شما، با `requireAdmin` در خط اول و تست کاربر غیرمجاز ساخته می‌شه.' },
        { title: 'توکن هیچ‌جا جز دو جا', body: 'توکن CLI فقط در `.tgcloud/` (در gitignore) و سکرت `TGCLOUD_TOKEN` گیت‌هاب. نه در کد، نه در مستندات، نه در چت با ایجنت.' },
        { title: 'هویت فقط از تلگرام', body: 'اندپوینت‌ها کاربر رو فقط از `ctx.initData.user` تأییدشده می‌شناسن. هر کاربر مینی‌اپ می‌تونه هر اندپوینتی رو صدا بزنه، پس ورودی اعتبارسنجی و درخواست‌ها محدود می‌شن.' },
        { title: 'سکرت‌ها در دیتابیس', body: 'کلیدهای API در جدول `settings` می‌مونن و هیچ‌وقت در بکاپ یا خروجی نمیان.' },
      ],
    },

    faq: {
      title: 'سؤال‌های رایج',
      items: [
        { q: 'سرور یا هاست لازم دارم؟', a: 'نه. کد روی Telegram Serverless اجرا می‌شه، دیتابیس SQLite داخلیه و مینی‌اپ روی `app<id>.tgcloud.ai` میزبانی می‌شه. **ولی قابلیت سرورلس هنوز برای همه فعال نشده** و اول باید درخواست بدی: مینی‌اپ **@BotFather** رو باز کن، یه ربات جدید بساز، وارد بخش **Serverless** همون ربات شو و از اونجا درخواست بده. وقتی BotFather بهت پیام داد که وایت‌لیستت باز شده، می‌تونی ازش استفاده کنی.' },
        { q: 'کدوم ایجنت‌ها کار می‌کنن؟', a: 'هر ایجنتی که بتونه فایل بخونه و دستور اجرا کنه. Claude Code از پلاگین و اسکیل‌ها مستقیم استفاده می‌کنه؛ Codex، Cursor، Gemini CLI و Copilot از `AGENTS.md`.' },
        { q: 'باید برنامه‌نویسی بلد باشم؟', a: 'لازم نیست، ولی کمک می‌کنه. ایجنت کد می‌نویسه و تست می‌کنه؛ کار شما توضیح خواسته، لاگین و تأیید تغییراته.' },
        { q: 'لاگ‌ها رو کجا ببینم؟', a: 'خروجی `console` در `npx tgcloud run` دیده می‌شه. برای همین خطاهای مهم (مثل شکست دستورهای ادمین) به ادمین در چت گزارش می‌شن.' },
        { q: 'ربات به چه زبانی حرف می‌زنه؟', a: 'به‌طور پیش‌فرض انگلیسی، و فارسی هم داره. هر کاربر از دکمه‌ی 🌐 زبانش رو عوض می‌کنه؛ اگه انتخاب نکنه، زبان اپ تلگرامش ملاکه. همه‌ی متن‌ها در `tgcloud/lib/i18n.js` هستن؛ برای زبان سوم به ایجنت بگو یه دیکشنری اضافه کنه.' },
        { q: 'این سایت رو روی فورک خودم چطور بالا بیارم؟', a: 'در فورک: Settings ← Pages ← Source: GitHub Actions. بعد workflow «Deploy site» رو اجرا کن.' },
      ],
    },

    footer: {
      by: 'ساخته‌ی',
      docs: 'مستندات رسمی Telegram Serverless',
      repo: 'مخزن',
    },
  },

  en: {
    lang: 'en',
    dir: 'ltr',
    title: 'tgcloud-kit · Telegram serverless bots with AI agents',
    switchLabel: 'فارسی',
    themeLabel: 'Toggle theme',
    copy: 'Copy',
    copied: 'Copied',
    nav: [
      { id: 'how', label: 'How it works' },
      { id: 'skills', label: 'Skills' },
      { id: 'start', label: 'Get started' },
      { id: 'commands', label: 'Commands' },
      { id: 'admin', label: 'Admin tools' },
      { id: 'faq', label: 'FAQ' },
    ],

    hero: {
      eyebrow: 'Telegram Serverless · AI Agents',
      title: 'Describe your Telegram bot in one sentence. Your AI agent builds it.',
      lead: 'tgcloud-kit is a set of skills, a tested scaffold and a guide that teach agents like Claude Code, Codex, Cursor, Gemini CLI and Copilot to build a Telegram Serverless bot from scratch, test it and ship it. No server, no separate database.',
      primary: 'Quick start',
      secondary: 'GitHub repository',
      preview: 'Try the live bot',
      chat: {
        you: 'You',
        agent: 'Agent',
        bot: 'Your bot',
        prompt: 'Build a booking bot for a barbershop, with a Mini App. My id is 123456789.',
        steps: [
          'Read the tgcloud-bot skill',
          'Project created: schema, handlers, endpoints',
          '15 offline tests passing ✓',
          'Run npx tgcloud login yourself; I take it from there',
        ],
        botReply: 'Hi 👋 What can I do for you?',
        buttons: ['📱 Open the app', '📖 Help'],
      },
    },

    how: {
      title: 'How it works',
      lead: 'Telegram Serverless runs your bot\'s JavaScript on Telegram\'s own servers: a built-in SQLite database, a webhook managed for you, and Mini App hosting next to the bot. The kit teaches your agent the platform\'s rules and an architecture that already ran in production.',
      steps: [
        { icon: '💬', title: 'You say what you want', body: 'In plain words: "a shop bot with a cart and a Mini App panel", plus your numeric Telegram id.' },
        { icon: '🧠', title: 'The agent builds it with the skills', body: 'Project layout, database, handlers, endpoints and tests follow the kit\'s architecture, and the tests run before any change.' },
        { icon: '🚀', title: 'The bot goes live on Telegram', body: 'You log in once. After that, every push to main deploys automatically with GitHub Actions.' },
      ],
    },

    skills: {
      title: 'Skills',
      lead: 'Four skills any agent can read. Claude Code installs them as a plugin; other agents reach them through `AGENTS.md`.',
      items: [
        {
          name: 'tgcloud-bot',
          tag: 'Start here',
          body: 'Turns an empty folder into a complete bot, then builds features on the same architecture.',
          points: ['User tracking, `/stop` and block detection', '`/start` menu, deep links, multi-step input', 'A back button on every screen, inline and reply keyboards', 'Bilingual: English (default) and Persian', 'User feedback forwarded to the admin', 'Offline tests on a mock SDK', 'Auto-deploy with GitHub Actions'],
        },
        {
          name: 'tgcloud-endpoints',
          tag: 'Mini App server side',
          body: 'A complete reference for writing `POST /api/<name>` for the Mini App, so the official docs don\'t need re-reading.',
          points: ['Auth from the verified `ctx.initData`', 'Errors with `EndpointError`', 'Safe pagination, search and filters', 'Per-user throttling', 'Testing with `tgcloud run`'],
        },
        {
          name: 'tgcloud-mini-app',
          tag: 'Front-end',
          body: 'A React + Vite Mini App that takes its colors from the Telegram theme and is hosted next to the bot at `app<id>.tgcloud.ai`.',
          points: ['Pick a design system: default (Telegram theme) or your own', 'Starter: profile and feedback form', 'Fullscreen, safe areas, light/dark', '`useEndpoint` hook and `callEndpoint`', '`tgcloud.jsonc` config and deploy'],
        },
        {
          name: 'tgcloud-widgets',
          tag: 'Bot API 10.4',
          body: 'HTML widgets inside the message itself: small interactive blocks that stay in the chat, like a counter, a live poll or a small game.',
          points: ['`sendWidget` and the `widget_query` handler', 'Widget state that only the bot writes', 'Size check (4 KB compressed at most)', 'Payments with the TON wallet', 'A counter example with tests'],
        },
      ],
    },

    start: {
      title: 'Get started',
      lead: 'Once your Serverless access is open, going from nothing to a bot that answers in Telegram usually takes under half an hour.',
      needTitle: 'You need',
      needs: [
        '**Node.js 22.12** or newer',
        'A bot from **@BotFather** (`/newbot`)',
        'Access to **Serverless**: not open to everyone yet; request it in the BotFather Mini App (see the FAQ)',
        'Once access is open, in BotFather: your bot → **Serverless** → **CLI Access → Access token**',
        'Your **numeric Telegram id** from **@userinfobot**',
        'An AI agent (or just a terminal)',
      ],
      tabsTitle: 'Pick your agent',
      tabs: [
        {
          id: 'plugin',
          label: 'Claude Code · plugin',
          intro: 'Install once; it works in every project:',
          code: PLUGIN,
          after: 'Then open Claude Code in an empty folder and type:',
          prompt: '/tgcloud-kit:tgcloud-bot 123456789 a café ordering bot with a Mini App',
        },
        {
          id: 'clone',
          label: 'Claude Code · clone',
          intro: 'Clone the repo and open Claude Code in it; the skills are picked up automatically:',
          code: `${CLONE}\nclaude`,
          after: 'Then type (the bot is created in its own folder next to this repo):',
          prompt: '/tgcloud-bot 123456789 a barbershop booking bot with a Mini App',
        },
        {
          id: 'others',
          label: 'Codex · Cursor · Gemini · Copilot',
          intro: 'Any agent that reads files and runs commands works. Clone the repo and open your agent in it:',
          code: `${CLONE}\ncodex          # or: cursor .  /  gemini  /  code .`,
          after: 'and type:',
          prompt: 'Read AGENTS.md and follow it to build me a Telegram serverless bot that takes food orders and has a Mini App panel. My numeric id is 123456789.',
        },
        {
          id: 'manual',
          label: 'Without AI',
          intro: 'One command: init, scaffold, install and tests. No clone needed:',
          code: 'npx github:IsAmirMmd/nim-byte-telegram-serverless my-bot --admin 123456789 --mini-app',
          after: 'or from a clone of the repo:',
          prompt: 'node scripts/create-bot.mjs ../my-bot --admin 123456789 --mini-app',
          promptIsCode: true,
        },
      ],
      stepsTitle: 'Once the project exists',
      steps: [
        { title: 'Link it to your bot', body: 'Run this in the bot\'s folder and paste the CLI token there. Never send the token to the agent in chat. In Claude Code you can type `! npx tgcloud login`.', code: 'npx tgcloud login' },
        { title: 'Deploy and create the tables', body: '`deploy` uploads the code (and the built Mini App); `migrate` applies database changes. A deploy never touches the database by itself.', code: 'npm run deploy\nnpx tgcloud migrate' },
        { title: 'Try it in Telegram', body: 'Send `/start` to your bot from the admin account: that also sets its command list, in English and Persian. With a Mini App, put the URL `push` printed in BotFather and in `MINI_APP_URL` in `tgcloud/lib/config.js`.' },
        { title: 'Deploy automatically', body: 'Put the bot\'s folder in its own GitHub repository and add the secret **`TGCLOUD_TOKEN`** (Settings → Secrets and variables → Actions). From then on every push to `main` builds, deploys, migrates and syncs the webhook.' },
        { title: 'Keep building with your agent', body: 'Open the bot\'s folder in your agent and ask for features. Its `AGENTS.md` and `docs/ARCHITECTURE.md` tell any agent where code goes and how it\'s tested.' },
      ],
    },

    prompts: {
      title: 'Example requests',
      lead: 'The more precise, the better the result. Copy any of these:',
      items: [
        'Build a serverless bot where users book barbershop appointments and the admin sees the day\'s bookings.',
        'Add a Mini App to my bot that shows the café menu with photos and prices and takes orders.',
        'Add an "invite friends" button with a personal link and count each person\'s invites.',
        'Switch the bot\'s texts to English and add a /lang command to change the language.',
      ],
    },

    commands: {
      title: 'Commands to run the bot',
      lead: 'All of them run in the bot\'s folder. The CLI is a dev-dependency, so call it with `npx` or `npm run`.',
      head: ['Command', 'What it does'],
      rows: [
        ['npm install', 'Install dependencies (once)'],
        ['npm test', 'Offline tests on the mock SDK; no network, no deploy'],
        ['npx tgcloud login', 'Link the project to the bot with the CLI token (once)'],
        ['npm run deploy', 'Build the Mini App (if any) and upload the code'],
        ['npx tgcloud migrate', 'Apply `tgcloud/schema.js` changes to the database'],
        ['npx tgcloud status', 'What changed locally and isn\'t in the cloud yet'],
        ["npx tgcloud run handlers/message '{ text: \"/start\", from: { id: 1 }, chat: { id: 1, type: \"private\" } }'", 'Run a handler in the cloud against the real database and Bot API, without deploying'],
        ["npx tgcloud run endpoints/me '{}' --ctx '{ initData: { user: { id: 1 } } }'", 'Run an endpoint in the cloud'],
        ['npx tgcloud webhook', 'Webhook status; fix it with `webhook sync`'],
        ['npx tgcloud pull', 'Bring the local project in line with the cloud'],
        ['npm run dev', 'Run the Mini App in a browser (endpoint calls only work inside Telegram)'],
      ],
    },

    admin: {
      title: 'Admin tools, only when you ask',
      lead: 'The bot template has no admin routes or commands: no `/api/sql`, no `/stats` or `/backup`, no admin panel. They are powerful, so each bot gets only the ones its owner asks for. Just ask your agent; the safe way to build each one is in every bot\'s `docs/ADMIN-TOOLS.md`.',
      items: [
        { ask: 'Add npm run sql to my bot', gets: 'An admin-only endpoint plus a terminal script to query the database directly' },
        { ask: 'Add /stats and /backup admin commands', gets: 'User stats and a CSV backup in the admin\'s chat, with error reports' },
        { ask: 'Build an admin panel in the Mini App with a users list', gets: 'Admin endpoints with `requireAdmin` and a paginated table' },
        { ask: 'Send me a report every day at 9am', gets: 'An admin command plus a scheduled GitHub Actions job' },
      ],
      sqlTitle: 'Once `npm run sql` is added:',
      sqlCode: 'npm run sql -- "SELECT * FROM users ORDER BY first_seen_at DESC LIMIT 5"\nnpm run sql -- "SELECT name FROM sqlite_master WHERE type = \'table\'"',
      sqlNote: 'Double quotes around the query, single quotes around values. Writes (UPDATE/DELETE) are real and can\'t be undone; run a SELECT with the same WHERE first.',
    },

    structure: {
      title: 'The bot you get',
      lead: 'Thin, separate layers: handlers and endpoints only route, the logic lives in `lib/`, and every feature has its own tests.',
    },

    security: {
      title: 'Security',
      items: [
        { title: 'No admin routes by default', body: 'A fresh bot exposes only `me` (plus `feedback` with the Mini App). Each admin tool is added on your request, with `requireAdmin` on its first line and a refused-caller test.' },
        { title: 'The token lives in two places only', body: 'The CLI token stays in `.tgcloud/` (gitignored) and the `TGCLOUD_TOKEN` GitHub secret. Never in code, docs, or a chat with the agent.' },
        { title: 'Identity comes from Telegram', body: 'Endpoints know the caller only from the verified `ctx.initData.user`. Every Mini App user can call every endpoint, so input is validated and calls are throttled.' },
        { title: 'Secrets stay in the database', body: 'API keys live in the `settings` table and never go into a backup or an export.' },
      ],
    },

    faq: {
      title: 'FAQ',
      items: [
        { q: 'Do I need a server or hosting?', a: 'No. The code runs on Telegram Serverless, the SQLite database is built in, and the Mini App is hosted at `app<id>.tgcloud.ai`. **But Serverless isn\'t open to everyone yet**, so you request access first: open the **@BotFather** Mini App, create a new bot, go to that bot\'s **Serverless** section and request access there. Once BotFather messages you that your whitelist is open, you can use it.' },
        { q: 'Which agents work?', a: 'Any agent that can read files and run commands. Claude Code uses the plugin and skills directly; Codex, Cursor, Gemini CLI and Copilot go through `AGENTS.md`.' },
        { q: 'Do I need to know how to code?', a: 'Not strictly, but it helps. The agent writes and tests the code; you describe what you want, log in, and review the changes.' },
        { q: 'Where are the logs?', a: '`console` output shows up in `npx tgcloud run`. That\'s why important failures (like a failing admin command) are reported to the admin in the chat.' },
        { q: 'What language does the bot speak?', a: 'English by default, and Persian too. Each user switches with the 🌐 Language button; until they do, their Telegram app\'s language decides. Every text is in `tgcloud/lib/i18n.js`: ask your agent to add a dictionary for a third language.' },
        { q: 'How do I host this site on my fork?', a: 'In your fork: Settings → Pages → Source: GitHub Actions, then run the "Deploy site" workflow.' },
      ],
    },

    footer: {
      by: 'Made by',
      docs: 'Official Telegram Serverless docs',
      repo: 'Repository',
    },
  },
};

// The generated bot's layout (same in both languages).
export const TREE = `my-bot/
├─ tgcloud/                 ← the code Telegram runs
│  ├─ schema.js             ← tables: settings, users
│  ├─ handlers/             ← message, callback_query, my_chat_member
│  ├─ endpoints/            ← me (+ feedback with the Mini App)
│  └─ lib/                  ← config, users, feedback, menu, access, query…
├─ src/, index.html         ← the Mini App (React + Vite), with --mini-app
├─ test/                    ← offline tests on a mock SDK
├─ docs/
│  ├─ ARCHITECTURE.md       ← where code goes, conventions, deploy
│  ├─ ADMIN-TOOLS.md        ← how to add admin tools on request
│  └─ tgcloud-sdk.md        ← the platform SDK reference
├─ .github/workflows/deploy.yml
├─ AGENTS.md                ← rules for any AI agent
└─ tgcloud.jsonc`;
