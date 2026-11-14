import {useCallback, useEffect, useRef, useState} from 'react';
import {Menu, UserRound} from 'lucide-react';
import type {User} from '@supabase/supabase-js';
import {Background} from './components/Background';
import {Sidebar} from './components/Sidebar';
import {LanguageMenu} from './components/LanguageMenu';
import {AuthModal} from './components/AuthModal';
import {Composer} from './components/Composer';
import {EmptyState} from './components/EmptyState';
import {MessageList} from './components/MessageList';
import {Wordmark} from './components/Logo';
import {useI18n} from './i18n';
import type {Dict} from './i18n/locales';
import {supabase} from './lib/supabase';
import {apiJson, ChatError, fetchHealth, streamChat} from './lib/api';
import * as store from './lib/store';
import type {ChatErrorCode, ChatMessage, ChatSummary} from './lib/types';

const uid = () => crypto.randomUUID();

const NO_RETRY: ChatErrorCode[] = ['ai_not_configured', 'refusal', 'auth_required', 'auth_not_configured', 'banned', 'daily_limit', 'ai_disabled'];

function errorText(code: ChatErrorCode, t: Dict): string {
  switch (code) {
    case 'ai_not_configured':
      return t.errAiNotConfigured;
    case 'rate_limited':
      return t.errRateLimited;
    case 'offline':
      return t.errOffline;
    case 'refusal':
      return t.errRefusal;
    case 'auth_required':
      return t.errAuthRequired;
    case 'auth_not_configured':
      return t.authNotConfigured;
    case 'banned':
      return t.errBanned;
    case 'daily_limit':
      return t.errDailyLimit;
    case 'ai_disabled':
      return t.errAiDisabled;
    default:
      return t.errGeneric;
  }
}

export default function App() {
  const {t, locale} = useI18n();

  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [error, setError] = useState<{code: ChatErrorCode; retry: (() => void) | null} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState<false | 'default' | 'chat'>(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pendingPromptRef = useRef<string | null>(null);
  const [aiReady, setAiReady] = useState(true);

  const abortRef = useRef<AbortController | null>(null);
  const loadTokenRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  // ---- Bootstrapping ----
  useEffect(() => {
    fetchHealth().then((h) => setAiReady(h.ai));
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({data}) => setUser(data.session?.user ?? null));
    const {data} = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  const resetConversation = useCallback(() => {
    abortRef.current?.abort();
    loadTokenRef.current++;
    setActiveId(null);
    setMessages([]);
    setError(null);
    setStreamingId(null);
  }, []);

  useEffect(() => {
    if (!user) {
      setChats([]);
      resetConversation();
      return;
    }
    store.listChats().then(setChats).catch((e) => console.warn('listChats', e));
  }, [user, resetConversation]);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    apiJson<{admin: boolean}>('/api/me')
      .then((r) => setIsAdmin(r.admin))
      .catch(() => setIsAdmin(false));
  }, [user]);

  // A prompt typed before signing in is sent right after sign-in succeeds.
  useEffect(() => {
    if (user && pendingPromptRef.current) {
      const prompt = pendingPromptRef.current;
      pendingPromptRef.current = null;
      setAuthOpen(false);
      send(prompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ---- Auto-scroll while the answer streams ----
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (messages.length === 0 && !error) el.scrollTop = 0;
    else if (stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, error]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

  // ---- Chat flow ----
  async function generate(history: ChatMessage[], chatId: string | null) {
    const assistantId = uid();
    setError(null);
    setMessages([...history, {id: assistantId, role: 'assistant', content: ''}]);
    setStreamingId(assistantId);
    stickToBottom.current = true;

    const controller = new AbortController();
    abortRef.current = controller;
    let acc = '';

    try {
      await streamChat(
        history.map(({role, content}) => ({role, content})),
        locale,
        (delta) => {
          acc += delta;
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? {...m, content: acc} : m)));
        },
        controller.signal,
      );
    } catch (err) {
      if (!controller.signal.aborted) {
        const code: ChatErrorCode = err instanceof ChatError ? err.code : 'server_error';
        if (!acc) setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        setError({code, retry: NO_RETRY.includes(code) ? null : () => generate(history, chatId)});
        if (code === 'ai_not_configured') setAiReady(false);
        if (code === 'auth_required') setAuthOpen('chat');
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setStreamingId((id) => (id === assistantId ? null : id));
      if (acc && chatId) {
        store
          .addMessage(chatId, 'assistant', acc)
          .then(() => bumpChat(chatId))
          .catch((e) => console.warn('save assistant', e));
      }
    }
  }

  function bumpChat(chatId: string) {
    setChats((prev) => {
      const c = prev.find((x) => x.id === chatId);
      if (!c) return prev;
      return [{...c, updated_at: new Date().toISOString()}, ...prev.filter((x) => x.id !== chatId)];
    });
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || streamingId) return;
    if (!user) {
      if (!supabase) {
        setError({code: 'auth_not_configured', retry: null});
        return;
      }
      pendingPromptRef.current = content;
      setInput(content);
      setAuthOpen('chat');
      return;
    }
    const userMsg: ChatMessage = {id: uid(), role: 'user', content};
    const history = [...messages.filter((m) => m.content), userMsg];
    setMessages(history);
    setInput('');
    setError(null);

    let chatId = activeId;
    if (user && !chatId) {
      try {
        const chat = await store.createChat(store.titleFrom(content));
        chatId = chat.id;
        setActiveId(chat.id);
        setChats((prev) => [chat, ...prev]);
      } catch (e) {
        console.warn('createChat', e);
      }
    }
    if (chatId) store.addMessage(chatId, 'user', content).catch((e) => console.warn('save user', e));

    await generate(history, chatId);
  }

  async function selectChat(id: string) {
    setSidebarOpen(false);
    if (id === activeId) return;
    abortRef.current?.abort();
    const token = ++loadTokenRef.current;
    setActiveId(id);
    setMessages([]);
    setError(null);
    try {
      const msgs = await store.loadMessages(id);
      if (loadTokenRef.current === token) {
        stickToBottom.current = true;
        setMessages(msgs);
      }
    } catch (e) {
      console.warn('loadMessages', e);
      if (loadTokenRef.current === token) setError({code: 'server_error', retry: null});
    }
  }

  async function removeChat(id: string) {
    const chat = chats.find((c) => c.id === id);
    if (!window.confirm(`${t.deleteTrip}: «${chat?.title || t.untitled}»?`)) return;
    try {
      await store.deleteChat(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (id === activeId) resetConversation();
    } catch (e) {
      console.warn('deleteChat', e);
    }
  }

  function newTrip() {
    resetConversation();
    setInput('');
    setSidebarOpen(false);
  }

  const empty = messages.length === 0 && !error;

  return (
    <div className="relative flex h-dvh">
      <Background />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        chats={chats}
        activeId={activeId}
        onNew={newTrip}
        onSelect={selectChat}
        onDelete={removeChat}
        isAdmin={isAdmin}
        onSignIn={() => {
          setSidebarOpen(false);
          setAuthOpen('default');
        }}
        onSignOut={() => supabase?.auth.signOut()}
      />

      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))] sm:px-6">
          <div className="flex items-center gap-2 lg:invisible">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label={t.menu}
              className="glass glass-hover ring-focus grid size-10 place-items-center rounded-full lg:hidden"
            >
              <Menu className="size-5 text-white/80" />
            </button>
            <div className="hidden sm:block lg:hidden">
              <Wordmark />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageMenu />
            {!user && (
              <button
                onClick={() => setAuthOpen('default')}
                className="glass glass-hover ring-focus flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-white lg:hidden"
              >
                <UserRound className="size-4 text-white/70" />
                {t.signIn}
              </button>
            )}
          </div>
        </header>

        <div ref={scrollRef} onScroll={onScroll} className="scroll-thin flex-1 overflow-y-auto px-4 sm:px-6">
          {empty ? (
            <EmptyState onPick={(p) => send(p)} />
          ) : (
            <MessageList
              messages={messages}
              streamingId={streamingId}
              error={error ? errorText(error.code, t) : null}
              onRetry={error?.retry ?? null}
            />
          )}
        </div>

        <div className="px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            {!aiReady && empty && (
              <p role="status" className="glass mb-3 rounded-2xl px-4 py-2.5 text-center text-sm text-amber-100/90">
                {t.errAiNotConfigured}
              </p>
            )}
            <Composer
              value={input}
              onChange={setInput}
              onSend={() => send(input)}
              onStop={() => abortRef.current?.abort()}
              streaming={streamingId !== null}
            />
            <p className="mt-2 text-center text-xs text-white/50">{t.disclaimer}</p>
          </div>
        </div>
      </main>

      {authOpen && (
        <AuthModal
          reason={authOpen}
          onClose={() => {
            setAuthOpen(false);
            pendingPromptRef.current = null;
          }}
        />
      )}
    </div>
  );
}
