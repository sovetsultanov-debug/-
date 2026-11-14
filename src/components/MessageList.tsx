import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {RotateCcw} from 'lucide-react';
import type {ChatMessage} from '../lib/types';
import {useI18n} from '../i18n';
import {LogoMark} from './Logo';

type Props = {
  messages: ChatMessage[];
  streamingId: string | null;
  error: string | null;
  onRetry: (() => void) | null;
};

export function MessageList({messages, streamingId, error, onRetry}: Props) {
  const {t} = useI18n();
  return (
    <div className="mx-auto w-full max-w-3xl space-y-7 pb-4 pt-6">
      {messages.map((m) =>
        m.role === 'user' ? (
          <div key={m.id} className="rise flex justify-end">
            <div className="glass max-w-[85%] whitespace-pre-wrap rounded-[22px] rounded-ee-md bg-iris/15 px-4.5 py-3 text-[15.5px] leading-relaxed text-white">
              {m.content}
            </div>
          </div>
        ) : (
          <div key={m.id} className="rise flex gap-3.5">
            <div className="mt-0.5 shrink-0">
              <LogoMark size={30} />
            </div>
            <div className="min-w-0 flex-1">
              {m.content ? (
                <div className={`prose-trip ${m.id === streamingId ? 'stream-caret' : ''}`}>
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{a: ({node: _node, ...props}) => <a {...props} target="_blank" rel="noreferrer" />}}
                  >
                    {m.content}
                  </Markdown>
                </div>
              ) : (
                <div className="flex h-8 items-center gap-3 text-sm text-white/55" role="status">
                  <span className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="typing-dot size-1.5 rounded-full bg-aqua"
                        style={{animationDelay: `${i * 0.15}s`}}
                      />
                    ))}
                  </span>
                  {t.thinking}
                </div>
              )}
            </div>
          </div>
        ),
      )}
      {error && (
        <div role="alert" className="rise glass flex flex-wrap items-center gap-3 rounded-2xl border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          <span className="flex-1">{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="ring-focus flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-medium text-white transition-colors hover:bg-white/15"
            >
              <RotateCcw className="size-3.5" />
              {t.retry}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
