import { createClient } from 'jsr:@supabase/supabase-js@2';

import {
  buildExpoPushMessage,
  isExpoPushToken,
  shouldClearTokenForReceipt,
  type PushEvent,
} from '../../../src/lib/push-notifications.ts';

const EXPO_PUSH_API_URL = 'https://exp.host/--/api/v2/push/send';

type SendPushBody = { userId: string; event: PushEvent };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const { userId, event } = (await req.json()) as SendPushBody;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', userId)
    .single();

  if (error || !profile?.push_token || !isExpoPushToken(profile.push_token)) {
    return jsonResponse({ skipped: true });
  }

  const message = buildExpoPushMessage(profile.push_token, event);

  const expoResponse = await fetch(EXPO_PUSH_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(message),
  });
  const expoResult = await expoResponse.json();
  const ticket = expoResult.data;

  if (ticket?.id) {
    await supabase.from('push_tickets').insert({
      user_id: userId,
      ticket_id: ticket.id,
      status: ticket.status === 'error' ? 'error' : 'pending',
    });
  }

  // A ticket can already report DeviceNotRegistered at send time (not just
  // later, via getReceipts) — e.g. for a token Expo already knows is dead.
  // Clear it now rather than waiting on check-push-receipts, which only
  // ever looks at tickets still marked 'pending'.
  if (ticket && shouldClearTokenForReceipt(ticket)) {
    await supabase.from('profiles').update({ push_token: null }).eq('id', userId);
  }

  return jsonResponse({ sent: true });
});
