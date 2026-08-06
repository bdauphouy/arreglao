import { supabase } from '../lib/supabase';
import type { PushEvent } from '../lib/push-notifications';

// Fire-and-forget: a push failing to send must never break the mutation
// (apply/assign/save/message) it's notifying about, so errors are swallowed
// here rather than propagated to the caller.
export async function notifyPush(userId: string, event: PushEvent): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('send-push', { body: { userId, event } });
    if (error) {
      console.warn('notifyPush failed', error);
    }
  } catch (error) {
    console.warn('notifyPush failed', error);
  }
}
