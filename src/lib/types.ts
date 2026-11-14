export type Role = 'user' | 'assistant';
export type ChatMessage = {id: string; role: Role; content: string};
export type ChatSummary = {id: string; title: string; updated_at: string};
export type ChatErrorCode =
  | 'ai_not_configured'
  | 'rate_limited'
  | 'offline'
  | 'refusal'
  | 'server_error'
  | 'upstream_unavailable'
  | 'bad_request'
  | 'auth_required'
  | 'auth_not_configured'
  | 'banned'
  | 'daily_limit'
  | 'ai_disabled';
