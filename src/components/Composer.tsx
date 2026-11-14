import {useEffect, useRef, type FormEvent, type KeyboardEvent} from 'react';
import {ArrowUp, Square} from 'lucide-react';
import {useI18n} from '../i18n';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  streaming: boolean;
};

export function Composer({value, onChange, onSend, onStop, streaming}: Props) {
  const {t} = useI18n();
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    if (streaming) return;
    if (value.trim()) onSend();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  const canSend = value.trim().length > 0;

  return (
    <form onSubmit={submit} className="glass flex items-end gap-2 rounded-[28px] p-2 ps-5 focus-within:border-white/25">
      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t.placeholder}
        aria-label={t.placeholder}
        className="scroll-thin max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-[16px] leading-6 text-white placeholder:text-white/40 focus:outline-none"
      />
      {streaming ? (
        <button
          type="button"
          onClick={onStop}
          aria-label={t.stop}
          title={t.stop}
          className="ring-focus grid size-11 shrink-0 place-items-center rounded-full bg-white text-ink transition-transform active:scale-95"
        >
          <Square className="size-3.5 fill-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSend}
          aria-label={t.send}
          title={t.send}
          className="bg-accent ring-focus grid size-11 shrink-0 place-items-center rounded-full text-ink shadow-[0_8px_24px_-8px_rgb(129_140_248/0.9)] transition-[transform,opacity,filter] hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:shadow-none"
        >
          <ArrowUp className="size-5" strokeWidth={2.5} />
        </button>
      )}
    </form>
  );
}
