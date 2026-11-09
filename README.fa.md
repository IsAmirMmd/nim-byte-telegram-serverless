<div align="center">

# tgcloud-kit

**ربات تلگرامت رو در یک جمله توصیف کن؛ ایجنت هوش مصنوعی اون رو روی [Telegram Serverless](https://core.telegram.org/bots/serverless) می‌سازه، تست و دیپلوی می‌کنه.**

[![GitHub stars](https://img.shields.io/github/stars/IsAmirMmd/nim-byte-telegram-serverless?style=for-the-badge&logo=github&color=f5c518)](https://github.com/IsAmirMmd/nim-byte-telegram-serverless/stargazers)
[![License: MIT](https://img.shields.io/github/license/IsAmirMmd/nim-byte-telegram-serverless?style=for-the-badge&color=blue)](LICENSE)

[راهنما](https://isamirmmd.github.io/nim-byte-telegram-serverless/?lang=fa) · [دموی زنده](https://t.me/tgCloudKit_bot) · [English](README.md)

</div>

<div dir="rtl">

اسکیل‌ها و یک اسکفولد تست‌شده که ایجنت‌ها (Claude Code، Codex، Cursor، Gemini CLI، Copilot) با اون‌ها ربات تلگرام می‌سازن؛ بدون سرور و بدون دیتابیس جدا. کد روی سرورهای خود تلگرام اجرا می‌شه، SQLite داخلیه و مینی‌اپ هم کنار ربات میزبانی می‌شه.

هر ربات این‌ها رو داره: منوی `/start` که همه‌ی صفحه‌هاش دکمه‌ی بازگشت دارن، انگلیسی و فارسی، ارسال نظر به ادمین، تست آفلاین و دیپلوی خودکار. مینی‌اپ React، ویجت‌های HTML و ابزار ادمین رو هر وقت بخوای اضافه می‌کنی.

## پیش‌نیازها

- Node.js 22.12 یا جدیدتر
- دسترسی به Telegram Serverless: در مینی‌اپ [@BotFather](https://t.me/BotFather) ربات ← **Serverless** و درخواست بده
- توکن CLI ربات (**Serverless ← CLI Access**) و آیدی عددی تلگرامت ([@userinfobot](https://t.me/userinfobot))

## ساختن ربات

**Claude Code:**

</div>

```
/plugin marketplace add IsAmirMmd/nim-byte-telegram-serverless
/plugin install tgcloud-kit@nim-byte
```

<div dir="rtl">

بعد در یک پوشه‌ی خالی:

</div>

```
/tgcloud-kit:tgcloud-bot 123456789 یه ربات نوبت‌دهی آرایشگاه با مینی‌اپ
```

<div dir="rtl">

**ایجنت‌های دیگه:** این مخزن رو کلون کن، ایجنت رو داخلش باز کن و بگو: «فایل AGENTS.md رو بخون و یه ربات تلگرام بساز که … آیدی عددی من 123456789 است.»

**بدون هوش مصنوعی:**

</div>

```bash
npx github:IsAmirMmd/nim-byte-telegram-serverless my-bot --admin 123456789 --mini-app
```

<div dir="rtl">

## بالا آوردن ربات

در پوشه‌ی ربات:

</div>

```bash
npx tgcloud login
```

```bash
npm run deploy
```

```bash
npx tgcloud migrate
```

<div dir="rtl">

به ربات `/start` بده. ربات خودش لیست دستورها و دکمه‌ی مینی‌اپ رو تنظیم می‌کنه و در BotFather کاری لازم نیست.

برای دیپلوی خودکار با هر push، ربات رو در یک مخزن جدای گیت‌هاب بذار و سکرت `TGCLOUD_TOKEN` رو اضافه کن.

توکن رو هیچ‌وقت در چت برای ایجنت نفرست و `npx tgcloud login` رو خودت اجرا کن.

## اسکیل‌ها

| اسکیل | برای |
|---|---|
| `tgcloud-bot` | نقطه‌ی شروع: اسکفولد، معماری، الگوها، ابزار ادمین در صورت درخواست |
| `tgcloud-endpoints` | endpointهای مینی‌اپ (`POST /api/<name>`) |
| `tgcloud-mini-app` | مینی‌اپ React |
| `tgcloud-widgets` | ویجت‌های HTML داخل پیام (Bot API 10.4) |

بقیه‌ی جزئیات (دستورها، ابزار ادمین، امنیت، ساختار ربات) در [سایت راهنما](https://isamirmmd.github.io/nim-byte-telegram-serverless/?lang=fa) و پوشه‌ی `docs/` هر ربات هست.

## لایسنس

[MIT](LICENSE)

</div>
