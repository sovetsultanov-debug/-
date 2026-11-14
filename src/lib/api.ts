import type {ChatErrorCode, ChatMessage} from './types';

export class ChatError extends Error {
  constructor(public code: ChatErrorCode) {
    super(code);
  }
}

/** Streams the assistant reply. Calls onDelta for every text chunk. */
export async function streamChat(
  messages: Pick<ChatMessage, 'role' | 'content'>[],
  locale: string,
  onDelta: (text: string) => void,
  signal: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({messages, locale}),
      signal,
    });
  } catch (err) {
    if (signal.aborted) throw err;
    throw new ChatError('offline');
  }

  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new ChatError((data.error as ChatErrorCode) ?? 'server_error');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    let chunk: ReadableStreamReadResult<Uint8Array>;
    try {
      chunk = await reader.read();
    } catch (err) {
      if (signal.aborted) throw err;
      throw new ChatError('offline');
    }
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, {stream: true});
    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      let event = 'message';
      let data = '';
      for (const line of raw.split('\n')) {
        if (line.startsWith('event: ')) event = line.slice(7);
        else if (line.startsWith('data: ')) data += line.slice(6);
      }
      if (!data) continue;
      const payload = JSON.parse(data);
      if (event === 'delta') onDelta(payload.text);
      else if (event === 'error') throw new ChatError(payload.error);
    }
  }
}

export async function fetchHealth(): Promise<{ai: boolean}> {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch {
    return {ai: true};
  }
}
