# Saiyakat — ИИ-планировщик путешествий

**Saiyakat** (от «саякат» — путешествие) — бесплатный сервис, где ИИ-агент на Claude помогает спланировать поездку в любую страну мира. Агент задаёт уточняющие вопросы (даты, бюджет, кто едет, интересы) и составляет маршрут по дням. Отвечает на том языке, на котором пишет пользователь.

- 🌍 **Без языкового барьера**: интерфейс на 9 языках (русский, English, кыргызча, қазақша, oʻzbekcha, Türkçe, 中文, Deutsch, العربية — с RTL), а ИИ отвечает на любом языке.
- 💬 **Чат с ИИ-агентом**: ответы приходят потоком (SSE), Markdown-разметка, кнопка «Стоп», повтор при ошибке.
- 🔐 **Аккаунты и история** через Supabase: чаты сохраняются и видны только владельцу (RLS). Без настроек Supabase работает гостевой режим.
- ✨ **Дизайн**: тёмная тема в стиле Apple, glassmorphism, «ночное небо над горами», адаптив под iPhone Pro Max (safe-area), `prefers-reduced-motion`.

## Стек

React 19 · Vite · Tailwind CSS 4 · Express · `@anthropic-ai/sdk` · `@supabase/supabase-js`

```
server.ts               Express: /api/chat (стрим Claude), /api/health, раздача фронтенда
src/App.tsx             логика чата, сохранение, авторизация
src/components/         Sidebar, Composer, MessageList, EmptyState, AuthModal, LanguageMenu, Background
src/i18n/locales.ts     все тексты интерфейса на 9 языках
src/lib/                API-клиент, Supabase, работа с историей
supabase/schema.sql     таблицы и политики доступа
```

## Запуск локально

```bash
npm install          # или bun install
cp .env.example .env # заполните ключи (см. ниже)
npm run dev          # http://localhost:3000
```

Сборка и продакшен-запуск: `npm run build && npm start`.

## Переменные окружения

| Переменная | Где | Зачем |
|---|---|---|
| `ANTHROPIC_API_KEY` | сервер (секрет) | ключ Claude. Без него чат показывает «ИИ-агент ещё не подключён» |
| `ANTHROPIC_MODEL` | сервер, необязательно | модель (по умолчанию `claude-opus-5-5`) |
| `VITE_SUPABASE_URL` | браузер (публично) | URL проекта Supabase |
| `VITE_SUPABASE_ANON_KEY` | браузер (публично) | anon-ключ Supabase |

`VITE_*` встраиваются в сборку, поэтому их нужно задать **до** `npm run build`.

## Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. Откройте **SQL Editor** и выполните `supabase/schema.sql`.
3. **Project Settings → API**: скопируйте URL и `anon` key в `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
4. **Authentication → URL Configuration**: укажите адрес сайта (для писем подтверждения).

## Деплой в Cloud Run

```bash
gcloud run deploy saiyakat --source . \
  --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest \
  --allow-unauthenticated
```

Для Supabase передайте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` как build-аргументы Docker (см. `Dockerfile`).

## Безопасность

- Ключ Claude хранится только на сервере, в браузер не попадает.
- `/api/chat` ограничивает частоту запросов (20 за 5 минут с одного IP), длину и число сообщений.
- Чаты в Supabase защищены Row Level Security: каждый пользователь видит только свои записи.
