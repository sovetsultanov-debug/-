import {LogOut, MessageSquare, Plus, ShieldCheck, Trash2, UserRound, X} from 'lucide-react';
import type {User} from '@supabase/supabase-js';
import type {ChatSummary} from '../lib/types';
import {useI18n} from '../i18n';
import {Wordmark} from './Logo';

type Props = {
  open: boolean;
  onClose: () => void;
  user: User | null;
  chats: ChatSummary[];
  activeId: string | null;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  isAdmin: boolean;
};

export function Sidebar({open, onClose, user, chats, activeId, onNew, onSelect, onDelete, onSignIn, onSignOut, isAdmin}: Props) {
  const {t} = useI18n();

  return (
    <>
      {open && (
        <button
          aria-label={t.close}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
        />
      )}
      <aside
        className={`glass-strong fixed inset-y-0 start-0 z-50 flex w-[290px] flex-col p-3 transition-transform duration-300 ease-out lg:relative lg:z-10 lg:m-3 lg:me-0 lg:rounded-[28px] ${
          open ? 'translate-x-0' : 'max-lg:ltr:-translate-x-full max-lg:rtl:translate-x-full'
        }`}
        aria-label={t.history}
      >
        <div className="flex items-center justify-between px-2 pb-3 pt-1.5">
          <Wordmark />
          <button
            onClick={onClose}
            aria-label={t.close}
            className="ring-focus grid size-9 place-items-center rounded-full text-fg/60 hover:bg-fg/10 lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        <button
          onClick={onNew}
          className="glass glass-hover ring-focus flex h-11 items-center gap-2.5 rounded-2xl px-4 text-sm font-medium text-fg"
        >
          <Plus className="size-4.5 text-gold" />
          {t.newTrip}
        </button>

        <p className="px-3 pb-2 pt-6 text-xs font-medium uppercase tracking-[0.08em] text-fg/50">{t.history}</p>

        <nav className="scroll-thin -mx-1 flex-1 space-y-0.5 overflow-y-auto px-1">
          {!user ? (
            <p className="px-3 text-sm leading-relaxed text-fg/50">{t.historyGuest}</p>
          ) : chats.length === 0 ? (
            <p className="px-3 text-sm leading-relaxed text-fg/50">{t.historyEmpty}</p>
          ) : (
            chats.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center rounded-xl transition-colors ${
                  c.id === activeId ? 'bg-fg/10' : 'hover:bg-fg/5'
                }`}
              >
                <button
                  onClick={() => onSelect(c.id)}
                  aria-current={c.id === activeId ? 'page' : undefined}
                  className="ring-focus flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm text-fg/80"
                >
                  <MessageSquare className="size-4 shrink-0 text-fg/35" />
                  <span className="truncate">{c.title || t.untitled}</span>
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  aria-label={`${t.deleteTrip}: ${c.title || t.untitled}`}
                  title={t.deleteTrip}
                  className="ring-focus me-1 grid size-10 shrink-0 lg:size-8 place-items-center rounded-lg text-fg/40 opacity-100 transition hover:bg-fg/10 hover:text-danger focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))
          )}
        </nav>

        <div className="mt-2 border-t border-fg/8 pt-3">
          {isAdmin && (
            <a
              href="/admin"
              className="ring-focus mb-1 flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-gold transition-colors hover:bg-fg/8"
            >
              <ShieldCheck className="size-4" />
              {t.adminPanel}
            </a>
          )}
          {user ? (
            <div className="flex items-center gap-3 rounded-2xl px-2 py-1.5">
              <div className="bg-accent grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-on-accent">
                {(user.email ?? '?').slice(0, 1).toUpperCase()}
              </div>
              <span className="min-w-0 flex-1 truncate text-sm text-fg/75">{user.email}</span>
              <button
                onClick={onSignOut}
                aria-label={t.signOut}
                title={t.signOut}
                className="ring-focus grid size-9 place-items-center rounded-full text-fg/55 hover:bg-fg/10 hover:text-fg"
              >
                <LogOut className="size-4 rtl:-scale-x-100" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="ring-focus flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-medium text-fg/85 transition-colors hover:bg-fg/8"
            >
              <UserRound className="size-4" />
              {t.signIn}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
