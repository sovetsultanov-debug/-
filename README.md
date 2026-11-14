# Saiyakat — ИИ-планировщик путешествий

**Saiyakat** (от «саякат» — путешествие) — бесплатный сервис, где ИИ-агент на Claude помогает спланировать поездку в любую страну мира. Агент задаёт уточняющие вопросы (даты, бюджет, кто едет, интересы) и составляет маршрут по дням. Отвечает на том языке, на котором пишет пользователь.

- 🌍 **Без языкового барьера**: интерфейс на 9 языках (русский, English, кыргызча, қазақша, oʻzbekcha, Türkçe, 中文, Deutsch, العربية — с RTL), а ИИ отвечает на любом языке.
- 💬 **Чат с ИИ-агентом**: ответы приходят потоком (SSE), Markdown-разметка, кнопка «Стоп», повтор при ошибке.
- 🔐 **Аккаунты и история** через Supabase. ИИ-чат доступен только после входа — так ключ Claude защищён от анонимного расхода.
- 🛡️ **Админ-панель** (`/admin`, только для email из `ADMIN_EMAILS`): статистика, пользователи с блокировкой, просмотр чатов, выключатель ИИ и дневной лимит запросов.
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
| `SUPABASE_SERVICE_ROLE_KEY` | сервер (секрет!) | проверка входа, лимиты, админка. **Никогда** не добавляйте к нему префикс `VITE_` |
| `ADMIN_EMAILS` | сервер | email администраторов через запятую (email должен быть подтверждён) |
| `SUPABASE_URL` | сервер, необязательно | по умолчанию берётся `VITE_SUPABASE_URL` |
| `ANTHROPIC_MODEL` | сервер, необязательно | модель (по умолчанию `claude-opus-5-5`) |
| `VITE_SUPABASE_URL` | браузер (публично) | URL проекта Supabase |
| `VITE_SUPABASE_ANON_KEY` | браузер (публично) | anon-ключ Supabase |

`VITE_*` встраиваются в сборку, поэтому их нужно задать **до** `npm run build`.

## Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. Откройте **SQL Editor** и выполните `supabase/schema.sql`.
3. **Project Settings → API**: скопируйте URL и `anon` key в `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, а `service_role` key — в секрет сервера `SUPABASE_SERVICE_ROLE_KEY`.
4. Зарегистрируйтесь на сайте под своим email, подтвердите его и укажите этот email в `ADMIN_EMAILS`. Админ-панель: `https://ваш-сайт/admin`.
5. **Authentication → URL Configuration**: укажите адрес сайта (для писем подтверждения).

## Деплой в Cloud Run

```bash
gcloud run deploy saiyakat --source . \
  --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest,SUPABASE_SERVICE_ROLE_KEY=supabase-service-role:latest \
  --set-env-vars ADMIN_EMAILS=you@example.com \
  --allow-unauthenticated
```

Для Supabase передайте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` как build-аргументы Docker (см. `Dockerfile`).

## Безопасность

- **Ключи только на сервере.** `ANTHROPIC_API_KEY` и `SUPABASE_SERVICE_ROLE_KEY` не попадают в браузер; храните их в Secret Manager, а не в коде.
- **ИИ только для вошедших.** `/api/chat` проверяет токен Supabase на сервере; гости получают предложение войти.
- **Лимиты:** дневной лимит на пользователя (настраивается в админке), плюс защита от всплесков — 15 запросов за 5 минут на пользователя и 30 на IP.
- **Блокировка** пользователя и **аварийный выключатель ИИ** — в админке. Администратора заблокировать нельзя.
- **Админ** определяется на сервере: email из `ADMIN_EMAILS` **и** подтверждён в Supabase. Чужой неподтверждённый аккаунт с вашим email доступа не получит.
- **Row Level Security:** пользователи видят только свои чаты; таблицы лимитов и настроек недоступны из браузера.
- **HTTP-заголовки:** CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy; запросы к API с чужих сайтов отклоняются.
- Пользователей предупреждают, что администратор может просматривать чаты для модерации.
