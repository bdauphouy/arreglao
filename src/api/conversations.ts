import type { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '../lib/supabase';

export type Conversation = {
  id: string;
  annonceId: string;
  participantOneId: string;
  participantTwoId: string;
  createdAt: string;
};

export type MessageStatus = 'unread' | 'read';

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  status: MessageStatus;
  createdAt: string;
};

const CONVERSATION_COLUMNS = 'id, annonce_id, participant_one_id, participant_two_id, created_at';
const MESSAGE_COLUMNS = 'id, conversation_id, sender_id, body, status, created_at';

function toConversation(row: {
  id: string;
  annonce_id: string;
  participant_one_id: string;
  participant_two_id: string;
  created_at: string;
}): Conversation {
  return {
    id: row.id,
    annonceId: row.annonce_id,
    participantOneId: row.participant_one_id,
    participantTwoId: row.participant_two_id,
    createdAt: row.created_at,
  };
}

function toMessage(row: {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  status: MessageStatus;
  created_at: string;
}): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function otherParticipant(conversation: Conversation, userId: string): string {
  return conversation.participantOneId === userId
    ? conversation.participantTwoId
    : conversation.participantOneId;
}

export async function getOrCreateConversation(
  annonceId: string,
  posterId: string,
  otherUserId: string,
): Promise<Conversation> {
  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select(CONVERSATION_COLUMNS)
    .eq('annonce_id', annonceId)
    .or(
      `and(participant_one_id.eq.${posterId},participant_two_id.eq.${otherUserId}),and(participant_one_id.eq.${otherUserId},participant_two_id.eq.${posterId})`,
    )
    .maybeSingle();
  if (findError) {
    throw findError;
  }
  if (existing) {
    return toConversation(existing);
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      annonce_id: annonceId,
      participant_one_id: posterId,
      participant_two_id: otherUserId,
    })
    .select(CONVERSATION_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toConversation(data);
}

export async function getConversation(conversationId: string): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_COLUMNS)
    .eq('id', conversationId)
    .single();
  if (error) {
    throw error;
  }
  return toConversation(data);
}

export async function listConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_COLUMNS)
    .or(`participant_one_id.eq.${userId},participant_two_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return data.map(toConversation);
}

export async function listLatestMessagesForConversations(
  conversationIds: string[],
): Promise<Map<string, Message>> {
  if (conversationIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_COLUMNS)
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false });
  if (error) {
    throw error;
  }

  const latestByConversation = new Map<string, Message>();
  for (const row of data) {
    const message = toMessage(row);
    if (!latestByConversation.has(message.conversationId)) {
      latestByConversation.set(message.conversationId, message);
    }
  }
  return latestByConversation;
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_COLUMNS)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) {
    throw error;
  }
  return data.map(toMessage);
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body })
    .select(MESSAGE_COLUMNS)
    .single();
  if (error) {
    throw error;
  }
  return toMessage(data);
}

export function subscribeToMessages(
  conversationId: string,
  onInsert: (message: Message) => void,
): RealtimeChannel {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(toMessage(payload.new as Parameters<typeof toMessage>[0])),
    )
    .subscribe();
}

// Marks the other participant's messages in this conversation as read — a
// no-op for messages already read or sent by readerId themselves.
export async function markConversationRead(
  conversationId: string,
  readerId: string,
): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ status: 'read' })
    .eq('conversation_id', conversationId)
    .eq('status', 'unread')
    .neq('sender_id', readerId);
  if (error) {
    throw error;
  }
}

export async function countUnreadMessages(userId: string): Promise<number> {
  // RLS ("Participants can view messages in their conversations") already
  // scopes this to the caller's own conversations.
  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'unread')
    .neq('sender_id', userId);
  if (error) {
    throw error;
  }
  return count ?? 0;
}

// Unscoped subscription (no conversation filter) backing the tab-bar unread
// badge, which needs to react to messages across every conversation the
// user has, not just one open thread — Realtime still only delivers rows
// this user's RLS SELECT policy allows, so this doesn't leak other users'
// messages. Channel name carries a random suffix so two overlapping
// subscriptions (e.g. an effect re-running before the previous one's
// cleanup lands) never collide on the same topic — reusing a fixed name
// throws "cannot add postgres_changes callbacks... after subscribe()" the
// second time .channel() resolves to the still-joined channel.
export function subscribeToMessageChanges(onChange: () => void): RealtimeChannel {
  return supabase
    .channel(`messages:unread-count:${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, onChange)
    .subscribe();
}
