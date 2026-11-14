import {useCallback, useEffect, useMemo, useState, type ReactNode} from 'react';
import type {User} from '@supabase/supabase-js';
import {
  ArrowLeft,
  Ban,
  BarChart3,
  Loader2,
  LogOut,
  MessageSquare,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Background} from '../components/Background';
import {AuthModal} from '../components/AuthModal';
import {Wordmark} from '../components/Logo';
import {supabase} from '../lib/supabase';
import {apiJson} from '../lib/api';
import {splitRoute} from '../lib/route';

type Stats = {
  users: number;
  banned: number;
  newUsersWeek: number;
  chats: number;
  messages: number;
  requests: {day: number; week: number; total: number};
  tokens: {day: number; week: number};
};
type AdminUser = {
  id: string;
  email: string | null;
  banned: boolean;
  created_at: string;
  requests_total: number;
  requests_today: number;
  tokens_total: number;
  last_active: string | null;
  chats: number;
};
type Settings = {ai_enabled: boolean; daily_limit: number};
type Tab = 'overview' | 'users' | 'settings';

const nf = new Intl.NumberFormat('ru-RU');
const df = new Intl.DateTimeFormat('ru-RU', {dateStyle: 'medium', timeStyle: 'short'});
const fmtDate = (s: string | null) => (s ? df.format(new Date(s)) : '—');

const ERRORS: Record<string, string> = {
  forbidden: 'Нет доступа.',
  auth_required: 'Сессия истекла. Войдите снова.',
  auth_not_configured: 'На сервере не настроен Supabase (SUPABASE_SERVICE_ROLE_KEY).',
  cannot_ban_admin: 'Администратора заблокировать нельзя.',
  server_error: 'Ошибка сервера. Попробуйте ещё раз.',
};
const errText = (e: unknown) => ERRORS[(e as Error).message] ?? ERRORS.server_error;

export function AdminApp() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabase);
  const [access, setAccess] = useState<'checking' | 'yes' | 'no'>('checking');
  const [tab, setTab] = useState<Tab>('overview');
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    document.title = 'Админ-панель — Saiyakat';
    if (!supabase) return;
    supabase.auth.getSession().then(({data}) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });
    const {data} = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setAccess('no');
      return;
    }
    setAccess('checking');
    apiJson<{admin: boolean}>('/api/me')
      .then((r) => setAccess(r.admin ? 'yes' : 'no'))
      .catch(() => setAccess('no'));
  }, [user]);

  let body: ReactNode;
  if (!ready || (user && access === 'checking')) {
    body = <Centered><Loader2 className="size-6 animate-spin text-fg/60" /></Centered>;
  } else if (!supabase) {
    body = <Notice icon={<ShieldAlert />} title="Supabase не настроен" text="Задайте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY при сборке." />;
  } else if (!user) {
    body = (
      <Notice icon={<ShieldCheck />} title="Вход для администратора" text="Войдите под аккаунтом, email которого указан в ADMIN_EMAILS.">
        <button onClick={() => setAuthOpen(true)} className="bg-accent ring-focus mt-5 h-11 rounded-2xl px-6 text-sm font-semibold text-on-accent">
          Войти
        </button>
      </Notice>
    );
  } else if (access === 'no') {
    body = (
      <Notice
        icon={<ShieldAlert />}
        title="Нет доступа"
        text={`Аккаунт ${user.email ?? ''} не является администратором. Email должен быть подтверждён и указан в ADMIN_EMAILS на сервере.`}
      />
    );
  } else {
    body = (
      <>
        <nav className="glass mb-6 inline-flex gap-1 rounded-2xl p-1" aria-label="Разделы">
          {(
            [
              ['overview', 'Обзор', BarChart3],
              ['users', 'Пользователи', Users],
              ['settings', 'Настройки ИИ', Settings2],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`ring-focus flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition-colors sm:px-4 ${
                tab === id ? 'bg-fg/12 text-fg' : 'text-fg/60 hover:text-fg'
              }`}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>
        {tab === 'overview' && <Overview />}
        {tab === 'users' && <UsersTab />}
        {tab === 'settings' && <SettingsTab />}
      </>
    );
  }

  return (
    <div dir="ltr" lang="ru" className="relative h-dvh overflow-y-auto scroll-thin">
      <Background />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-[max(16px,env(safe-area-inset-top))] sm:px-6">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Wordmark />
            <span className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 text-xs font-medium uppercase tracking-[0.12em] text-fg">Админ</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="glass glass-hover ring-focus flex h-10 items-center gap-2 rounded-full px-4 text-sm text-fg/85">
              <ArrowLeft className="size-4" />
              На сайт
            </a>
            {user && (
              <button
                onClick={() => supabase?.auth.signOut()}
                aria-label="Выйти"
                title="Выйти"
                className="glass glass-hover ring-focus grid size-10 place-items-center rounded-full"
              >
                <LogOut className="size-4 text-fg/75" />
              </button>
            )}
          </div>
        </header>
        {body}
      </div>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------

function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    apiJson<Stats>('/api/admin/stats').then(setStats).catch((e) => setError(errText(e)));
  }, []);
  useEffect(load, [load]);

  if (error) return <ErrorBox text={error} onRetry={load} />;
  if (!stats) return <Centered><Loader2 className="size-6 animate-spin text-fg/60" /></Centered>;

  const cards: [string, number, string?][] = [
    ['Пользователи', stats.users, `+${nf.format(stats.newUsersWeek)} за неделю`],
    ['Заблокировано', stats.banned],
    ['Чаты', stats.chats],
    ['Сообщения', stats.messages],
    ['Запросы к ИИ · 24 ч', stats.requests.day],
    ['Запросы к ИИ · 7 дней', stats.requests.week],
    ['Запросы к ИИ · всего', stats.requests.total],
    ['Токены · 24 ч', stats.tokens.day, `${nf.format(stats.tokens.week)} за 7 дней`],
  ];

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.02em] text-fg">Обзор</h1>
        <button onClick={load} className="ring-focus flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-fg/65 hover:bg-fg/8 hover:text-fg">
          <RefreshCw className="size-3.5" /> Обновить
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([label, value, hint]) => (
          <div key={label} className="glass rounded-3xl p-5">
            <p className="text-[13px] text-fg/55">{label}</p>
            <p className="mt-2 font-display text-4xl font-semibold text-fg tabular-nums">{nf.format(value)}</p>
            {hint && <p className="mt-1 text-xs text-fg/45">{hint}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [viewing, setViewing] = useState<AdminUser | null>(null);

  const load = useCallback((query: string) => {
    setError(null);
    apiJson<{users: AdminUser[]}>(`/api/admin/users?q=${encodeURIComponent(query)}`)
      .then((r) => setUsers(r.users))
      .catch((e) => setError(errText(e)));
  }, []);

  useEffect(() => {
    const id = setTimeout(() => load(q), 250);
    return () => clearTimeout(id);
  }, [q, load]);

  async function toggleBan(u: AdminUser) {
    const next = !u.banned;
    if (!window.confirm(next ? `Заблокировать ${u.email}? Пользователь не сможет обращаться к ИИ.` : `Разблокировать ${u.email}?`)) return;
    setBusyId(u.id);
    try {
      await apiJson(`/api/admin/users/${u.id}/ban`, {method: 'POST', body: JSON.stringify({banned: next})});
      setUsers((prev) => prev?.map((x) => (x.id === u.id ? {...x, banned: next} : x)) ?? null);
    } catch (e) {
      window.alert(errText(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.02em] text-fg">Пользователи</h1>
        <label className="glass flex h-10 w-full items-center gap-2 rounded-full px-4 sm:w-72">
          <Search className="size-4 text-fg/45" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по email"
            aria-label="Поиск по email"
            className="w-full bg-transparent text-sm text-fg placeholder:text-fg/40 focus:outline-none"
          />
        </label>
      </div>
      {error ? (
        <ErrorBox text={error} onRetry={() => load(q)} />
      ) : !users ? (
        <Centered><Loader2 className="size-6 animate-spin text-fg/60" /></Centered>
      ) : users.length === 0 ? (
        <p className="glass rounded-3xl p-6 text-sm text-fg/60">Пользователей не найдено.</p>
      ) : (
        <div className="glass overflow-x-auto rounded-3xl">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-fg/8 text-start text-xs uppercase tracking-wider text-fg/45">
                <th className="px-5 py-3 text-start font-medium">Email</th>
                <th className="px-3 py-3 text-start font-medium">Регистрация</th>
                <th className="px-3 py-3 text-end font-medium">Запросы 24 ч</th>
                <th className="px-3 py-3 text-end font-medium">Всего</th>
                <th className="px-3 py-3 text-end font-medium">Чаты</th>
                <th className="px-3 py-3 text-start font-medium">Активность</th>
                <th className="px-5 py-3 text-end font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-fg/5 last:border-0 hover:bg-fg/[0.03]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-fg">{u.email ?? '—'}</span>
                      {u.banned && <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[11px] font-medium text-danger">заблокирован</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-fg/60">{fmtDate(u.created_at)}</td>
                  <td className="px-3 py-3 text-end tabular-nums text-fg/80">{nf.format(u.requests_today)}</td>
                  <td className="px-3 py-3 text-end tabular-nums text-fg/80">{nf.format(u.requests_total)}</td>
                  <td className="px-3 py-3 text-end tabular-nums text-fg/80">{nf.format(u.chats)}</td>
                  <td className="px-3 py-3 text-fg/60">{fmtDate(u.last_active)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setViewing(u)}
                        className="ring-focus flex h-9 items-center gap-1.5 rounded-xl px-3 text-fg/75 hover:bg-fg/8 hover:text-fg"
                      >
                        <MessageSquare className="size-4" /> Чаты
                      </button>
                      <button
                        onClick={() => toggleBan(u)}
                        disabled={busyId === u.id}
                        className={`ring-focus flex h-9 items-center gap-1.5 rounded-xl px-3 disabled:opacity-50 ${
                          u.banned ? 'text-gold hover:bg-gold/10' : 'text-danger hover:bg-danger/10'
                        }`}
                      >
                        {busyId === u.id ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
                        {u.banned ? 'Разблокировать' : 'Заблокировать'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {viewing && <ChatViewer user={viewing} onClose={() => setViewing(null)} />}
    </section>
  );
}

type AdminChat = {id: string; title: string; updated_at: string};
type AdminMsg = {id: string; role: 'user' | 'assistant'; content: string; created_at: string};

function ChatViewer({user, onClose}: {user: AdminUser; onClose: () => void}) {
  const [chats, setChats] = useState<AdminChat[] | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<AdminMsg[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiJson<{chats: AdminChat[]}>(`/api/admin/users/${user.id}/chats`)
      .then((r) => {
        setChats(r.chats);
        if (r.chats[0]) setActive(r.chats[0].id);
      })
      .catch((e) => setError(errText(e)));
  }, [user.id]);

  useEffect(() => {
    if (!active) return;
    setMsgs(null);
    apiJson<{messages: AdminMsg[]}>(`/api/admin/chats/${active}/messages`)
      .then((r) => setMsgs(r.messages))
      .catch((e) => setError(errText(e)));
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const activeChat = useMemo(() => chats?.find((c) => c.id === active), [chats, active]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6">
      <button aria-label="Закрыть" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div role="dialog" aria-modal="true" aria-label={`Чаты ${user.email}`} className="glass-strong rise relative flex h-full max-h-[820px] w-full max-w-5xl flex-col overflow-hidden rounded-[28px]">
        <div className="flex items-center justify-between border-b border-fg/8 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs text-fg/45">Чаты пользователя</p>
            <p className="truncate font-medium text-fg">{user.email}</p>
          </div>
          <button onClick={onClose} aria-label="Закрыть" className="ring-focus grid size-9 place-items-center rounded-full text-fg/60 hover:bg-fg/10">
            <X className="size-5" />
          </button>
        </div>
        {error ? (
          <div className="p-5"><ErrorBox text={error} /></div>
        ) : !chats ? (
          <Centered><Loader2 className="size-6 animate-spin text-fg/60" /></Centered>
        ) : chats.length === 0 ? (
          <p className="p-6 text-sm text-fg/55">У пользователя нет сохранённых чатов.</p>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <ul className="scroll-thin max-h-40 shrink-0 overflow-y-auto border-b border-fg/8 p-2 md:max-h-none md:w-64 md:border-b-0 md:border-e">
              {chats.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setActive(c.id)}
                    className={`ring-focus w-full rounded-xl px-3 py-2.5 text-start text-sm ${c.id === active ? 'bg-fg/10 text-fg' : 'text-fg/70 hover:bg-fg/5'}`}
                  >
                    <span className="block truncate">{c.title || 'Без названия'}</span>
                    <span className="block text-xs text-fg/40">{fmtDate(c.updated_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="scroll-thin min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              {activeChat && <p className="text-sm font-medium text-fg/80">{activeChat.title}</p>}
              {!msgs ? (
                <Loader2 className="size-5 animate-spin text-fg/60" />
              ) : (
                msgs.map((m) => (
                  <div key={m.id} className={m.role === 'user' ? 'ms-auto max-w-[85%]' : 'max-w-[95%]'}>
                    <p className="mb-1 text-[11px] uppercase tracking-wider text-fg/40">
                      {m.role === 'user' ? 'Пользователь' : 'ИИ'} · {fmtDate(m.created_at)}
                    </p>
                    {m.role === 'user' ? (
                      <div className="whitespace-pre-wrap rounded-2xl bg-fg/10 px-4 py-3 text-sm leading-relaxed text-fg">{m.content}</div>
                    ) : (
                      <div className="prose-trip rounded-2xl bg-fg/5 px-4 py-3 !text-sm">
                        <Markdown remarkPlugins={[remarkGfm]} skipHtml>
                          {splitRoute(m.content).text}
                        </Markdown>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [limit, setLimit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    apiJson<Settings>('/api/admin/settings')
      .then((s) => {
        setSettings(s);
        setLimit(String(s.daily_limit));
      })
      .catch((e) => setError(errText(e)));
  }, []);

  async function save(next: Settings) {
    setStatus('saving');
    setError(null);
    try {
      const s = await apiJson<Settings>('/api/admin/settings', {method: 'PUT', body: JSON.stringify(next)});
      setSettings(s);
      setLimit(String(s.daily_limit));
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      setError(errText(e));
      setStatus('idle');
    }
  }

  if (error && !settings) return <ErrorBox text={error} />;
  if (!settings) return <Centered><Loader2 className="size-6 animate-spin text-fg/60" /></Centered>;

  const parsed = Number(limit);
  const limitValid = limit !== '' && Number.isInteger(parsed) && parsed >= 0 && parsed <= 10000;

  return (
    <section className="max-w-2xl space-y-4">
      <h1 className="font-display text-3xl font-semibold uppercase tracking-[0.02em] text-fg">Настройки ИИ</h1>

      <div className="glass flex items-center justify-between gap-4 rounded-3xl p-5">
        <div>
          <p className="font-medium text-fg">ИИ-агент включён</p>
          <p className="mt-1 text-sm text-fg/55">
            Выключите, чтобы мгновенно остановить расходы на Claude. Для вас как администратора ИИ продолжит работать.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={settings.ai_enabled}
          aria-label="ИИ-агент включён"
          disabled={status === 'saving'}
          onClick={() => {
            if (settings.ai_enabled && !window.confirm('Отключить ИИ для всех пользователей?')) return;
            save({...settings, ai_enabled: !settings.ai_enabled});
          }}
          className={`ring-focus relative h-8 w-14 shrink-0 rounded-full transition-colors ${settings.ai_enabled ? 'bg-accent' : 'bg-fg/15'}`}
        >
          <span className={`absolute top-1 size-6 rounded-full bg-bg shadow transition-[inset-inline-start] ${settings.ai_enabled ? 'start-7' : 'start-1'}`} />
        </button>
      </div>

      <form
        className="glass rounded-3xl p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (limitValid) save({...settings, daily_limit: parsed});
        }}
      >
        <label htmlFor="limit" className="font-medium text-fg">
          Лимит запросов на пользователя за 24 часа
        </label>
        <p className="mt-1 text-sm text-fg/55">0 — запретить запросы всем, кроме администратора. На вас лимит не действует.</p>
        <div className="mt-4 flex gap-2">
          <input
            id="limit"
            type="number"
            min={0}
            max={10000}
            inputMode="numeric"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="glass h-11 w-32 rounded-2xl px-4 text-fg tabular-nums focus:border-accent/70 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!limitValid || status === 'saving' || parsed === settings.daily_limit}
            className="bg-accent ring-focus h-11 rounded-2xl px-5 text-sm font-semibold text-on-accent disabled:opacity-40"
          >
            Сохранить
          </button>
        </div>
      </form>

      <p className="h-5 text-sm" role="status">
        {status === 'saving' && <span className="text-fg/60">Сохраняю…</span>}
        {status === 'saved' && <span className="text-gold">Сохранено</span>}
        {error && <span className="text-danger">{error}</span>}
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------

function Centered({children}: {children: ReactNode}) {
  return <div className="grid min-h-[30vh] place-items-center">{children}</div>;
}

function Notice({icon, title, text, children}: {icon: ReactNode; title: string; text: string; children?: ReactNode}) {
  return (
    <div className="glass mx-auto mt-[8vh] flex max-w-md flex-col items-center rounded-[28px] p-8 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-fg/8 text-gold [&>svg]:size-7">{icon}</div>
      <h1 className="mt-4 text-xl font-semibold text-fg">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-fg/60">{text}</p>
      {children}
    </div>
  );
}

function ErrorBox({text, onRetry}: {text: string; onRetry?: () => void}) {
  return (
    <div role="alert" className="glass flex flex-wrap items-center gap-3 rounded-2xl border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">
      <span className="flex-1">{text}</span>
      {onRetry && (
        <button onClick={onRetry} className="ring-focus rounded-full bg-fg/10 px-3 py-1.5 font-medium text-fg hover:bg-fg/15">
          Повторить
        </button>
      )}
    </div>
  );
}
