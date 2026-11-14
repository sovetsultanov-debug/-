import {useEffect, useRef, useState, type FormEvent} from 'react';
import {Loader2, Lock, Mail, X} from 'lucide-react';
import {supabase} from '../lib/supabase';
import {useI18n} from '../i18n';
import {LogoMark} from './Logo';

export function AuthModal({onClose, reason = 'default'}: {onClose: () => void; reason?: 'default' | 'chat'}) {
  const {t} = useI18n();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'in') {
        const {error} = await supabase.auth.signInWithPassword({email, password});
        if (error) setError(t.authInvalid);
        else onClose();
      } else {
        const {data, error} = await supabase.auth.signUp({email, password});
        if (error) setError(error.message);
        else if (data.session) onClose();
        else {
          setInfo(t.checkEmail);
          setMode('in');
        }
      }
    } catch {
      setError(t.errOffline);
    } finally {
      setBusy(false);
    }
  }

  const title = mode === 'in' ? t.authTitleIn : t.authTitleUp;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button aria-label={t.close} onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="glass-strong rise relative w-full max-w-[400px] rounded-t-[32px] p-7 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:rounded-[32px]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="ring-focus absolute end-4 top-4 grid size-9 place-items-center rounded-full text-fg/60 transition-colors hover:bg-fg/10 hover:text-fg"
        >
          <X className="size-5" />
        </button>
        <div className="flex flex-col items-center text-center">
          <LogoMark size={52} />
          <h2 id="auth-title" className="mt-4 text-2xl font-semibold tracking-tight text-fg">
            {title}
          </h2>
          {reason === 'chat' && <p className="mt-2 text-[15px] font-medium text-gold">{t.signInToChat}</p>}
          <p className="mt-1.5 text-sm leading-relaxed text-fg/55">{t.authSubtitle}</p>
        </div>

        {!supabase ? (
          <p className="mt-6 rounded-2xl border border-fg/10 bg-fg/5 p-4 text-sm text-fg/75">
            {t.authNotConfigured}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="glass flex items-center gap-3 rounded-2xl px-4 focus-within:border-accent/70">
              <Mail className="size-4 shrink-0 text-fg/45" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder={t.email}
                aria-label={t.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full bg-transparent text-[15px] text-fg placeholder:text-fg/40 focus:outline-none"
              />
            </label>
            <label className="glass flex items-center gap-3 rounded-2xl px-4 focus-within:border-accent/70">
              <Lock className="size-4 shrink-0 text-fg/45" />
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
                placeholder={mode === 'up' ? `${t.password} · ${t.passwordHint}` : t.password}
                aria-label={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full bg-transparent text-[15px] text-fg placeholder:text-fg/40 focus:outline-none"
              />
            </label>
            {error && (
              <p role="alert" className="px-1 text-sm text-danger">
                {error}
              </p>
            )}
            {info && (
              <p role="status" className="px-1 text-sm text-gold">
                {info}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="bg-accent ring-focus flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-on-accent shadow-[0_10px_30px_-10px_var(--c-accent-glow)] transition-[filter,transform] hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {mode === 'in' ? t.submitIn : t.submitUp}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'in' ? 'up' : 'in');
                setError(null);
                setInfo(null);
              }}
              className="ring-focus w-full rounded-xl py-2 text-sm text-fg/65 transition-colors hover:text-fg"
            >
              {mode === 'in' ? t.toSignUp : t.toSignIn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
