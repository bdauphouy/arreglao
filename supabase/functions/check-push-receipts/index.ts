import { createClient } from 'jsr:@supabase/supabase-js@2';

import { shouldClearTokenForReceipt, type PushReceipt } from '../../../src/lib/push-notifications.ts';

const EXPO_RECEIPTS_API_URL = 'https://exp.host/--/api/v2/push/getReceipts';
const BATCH_SIZE = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

// Meant to run on a schedule (Supabase Dashboard > Edge Functions > Cron, or
// pg_cron calling this via pg_net) — Expo asks receipts not be checked until
// ~15 minutes after a ticket was issued, which a single request-response
// edge function can't wait out on its own.
Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: tickets, error } = await supabase
    .from('push_tickets')
    .select('id, user_id, ticket_id')
    .eq('status', 'pending');
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  if (!tickets || tickets.length === 0) {
    return new Response(JSON.stringify({ checked: 0 }), { status: 200 });
  }

  const staleUserIds = new Set<string>();
  let checked = 0;

  for (const batch of chunk(tickets, BATCH_SIZE)) {
    const response = await fetch(EXPO_RECEIPTS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ids: batch.map((ticket) => ticket.ticket_id) }),
    });
    const result = await response.json();
    const receipts = (result.data ?? {}) as Record<string, PushReceipt>;

    for (const ticket of batch) {
      const receipt = receipts[ticket.ticket_id];
      if (!receipt) {
        continue;
      }
      checked += 1;

      if (shouldClearTokenForReceipt(receipt)) {
        staleUserIds.add(ticket.user_id);
      }
      await supabase
        .from('push_tickets')
        .update({ status: receipt.status === 'error' ? 'error' : 'ok' })
        .eq('id', ticket.id);
    }
  }

  if (staleUserIds.size > 0) {
    await supabase
      .from('profiles')
      .update({ push_token: null })
      .in('id', Array.from(staleUserIds));
  }

  return new Response(JSON.stringify({ checked, cleared: staleUserIds.size }), { status: 200 });
});
