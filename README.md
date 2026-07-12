# EKSAAL NAIL — Telegram Mini App

Telegram Mini App для записи клиентов на маникюр к мастеру EKSAAL NAIL.

## Статус

Каркас проекта (scaffold). Бизнес-логика ещё не реализована.

## Стек

- **apps/web** — React + TypeScript + Vite, Tailwind CSS, Framer Motion, `@telegram-apps/sdk`
- **apps/api** — Node.js + TypeScript + Express, Prisma ORM (PostgreSQL)
- **apps/bot** — Telegraf (Telegram-бот, webhook)
- **packages/shared** — общие типы и zod-схемы между web/api/bot

## Структура проекта

```
eksaal.nail/
├── apps/
│   ├── web/      # Mini App (клиент + админка)
│   ├── api/      # Backend REST API
│   └── bot/      # Telegram-бот
├── packages/
│   └── shared/   # общие типы/схемы
```

## Дизайн

Luxury beauty стиль: графитовый фон, пыльно-розовая палитра, типографика Bodoni Moda / Jost.
Цветовые токены заданы в `apps/web/tailwind.config.ts`.

## Установка

```bash
npm install
```

## Запуск в режиме разработки

Каждое приложение запускается отдельно:

```bash
npm run dev:web   # Mini App на Vite dev server
npm run dev:api   # Backend API
npm run dev:bot   # Telegram-бот
```

## Переменные окружения

Скопируйте `.env.example` в `.env` в каждом приложении, где он есть:

- `apps/web/.env.example`
- `apps/api/.env.example`
- `apps/bot/.env.example`

## База данных

Схема Prisma находится в `apps/api/prisma/schema.prisma`. Модели данных будут добавлены на следующем этапе разработки.
