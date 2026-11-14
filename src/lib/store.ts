import {supabase} from './supabase';
import type {ChatMessage, ChatSummary, Role} from './types';

// All queries run under the signed-in user's session; row-level security in
// supabase/schema.sql guarantees users only ever see their own chats.

export async function listChats(): Promise<ChatSummary[]> {
  if (!supabase) return [];
  const {data, error} = await supabase
    .from('chats')
    .select('id, title, updated_at')
    .order('updated_at', {ascending: false})
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function loadMessages(chatId: string): Promise<ChatMessage[]> {
  if (!supabase) return [];
  const {data, error} = await supabase
    .from('messages')
    .select('id, role, content')
    .eq('chat_id', chatId)
    .order('created_at', {ascending: true});
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function createChat(title: string): Promise<ChatSummary> {
  if (!supabase) throw new Error('supabase_not_configured');
  const {data, error} = await supabase
    .from('chats')
    .insert({title})
    .select('id, title, updated_at')
    .single();
  if (error) throw error;
  return data;
}

export async function addMessage(chatId: string, role: Role, content: string): Promise<void> {
  if (!supabase) return;
  const {error} = await supabase.from('messages').insert({chat_id: chatId, role, content});
  if (error) throw error;
  await supabase.from('chats').update({updated_at: new Date().toISOString()}).eq('id', chatId);
}

export async function deleteChat(chatId: string): Promise<void> {
  if (!supabase) return;
  const {error} = await supabase.from('chats').delete().eq('id', chatId);
  if (error) throw error;
}

export function titleFrom(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean;
}
