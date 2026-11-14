import {supabase} from './supabase';
import type {ChatErrorCode, ChatMessage} from './types';

/** fetch() with the signed-in user's access token attached. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : undefined;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(path, {...init, headers});
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as {error?: string}).error ?? `http_${res.status}`);
  return data as T;
}

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
    res = await apiFetch('/api/chat', {
      method: 'POST',
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

export async function fetchHealth(): Promise<{ai: boolean; auth?: boolean}> {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch {
    return {ai: true};
  }
}
