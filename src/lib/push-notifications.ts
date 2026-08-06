// Pure push-notification logic shared by the RN client (src/api/push-notifications.ts)
// and the Deno edge functions (supabase/functions/send-push,
// supabase/functions/check-push-receipts), which import this file directly by
// relative path — keep it free of RN/Node-only imports.

export type PushEvent =
  | { type: 'application_received'; annonceId: string; annonceTitle: string; applicantName: string }
  | { type: 'application_accepted'; annonceId: string; annonceTitle: string; conversationId: string }
  | { type: 'annonce_saved'; annonceId: string; annonceTitle: string }
  | { type: 'message_received'; conversationId: string; senderName: string; messagePreview: string };

export type PushNotificationContent = { title: string; body: string };

export function buildPushContent(event: PushEvent): PushNotificationContent {
  switch (event.type) {
    case 'application_received':
      return {
        title: 'Nueva postulación',
        body: `${event.applicantName} se postuló a "${event.annonceTitle}"`,
      };
    case 'application_accepted':
      return {
        title: '¡Fuiste elegido!',
        body: `Te eligieron para "${event.annonceTitle}"`,
      };
    case 'annonce_saved':
      return {
        title: 'Nuevo guardado',
        body: `Alguien guardó tu publicación "${event.annonceTitle}"`,
      };
    case 'message_received':
      return {
        title: event.senderName,
        body: event.messagePreview,
      };
  }
}

export type PushEventData = { type: PushEvent['type']; annonceId?: string; conversationId?: string };

export function pushEventData(event: PushEvent): PushEventData {
  switch (event.type) {
    case 'application_received':
      return { type: event.type, annonceId: event.annonceId };
    case 'application_accepted':
      return { type: event.type, conversationId: event.conversationId };
    case 'annonce_saved':
      return { type: event.type, annonceId: event.annonceId };
    case 'message_received':
      return { type: event.type, conversationId: event.conversationId };
  }
}

// Screen + id rather than a ready-made path string, so the call site can
// build the route with a literal template expression expo-router's typed
// routes will accept (`router.push(`/annonces/${id}`)`) instead of a plain
// `string`, which typed routes reject.
export type PushRoute = { screen: 'annonce'; id: string } | { screen: 'conversation'; id: string };

export function routeForPushData(data: Record<string, unknown>): PushRoute | null {
  switch (data.type) {
    case 'application_accepted':
    case 'message_received':
      return typeof data.conversationId === 'string'
        ? { screen: 'conversation', id: data.conversationId }
        : null;
    case 'application_received':
    case 'annonce_saved':
      return typeof data.annonceId === 'string' ? { screen: 'annonce', id: data.annonceId } : null;
    default:
      return null;
  }
}

const EXPO_PUSH_TOKEN_PATTERN = /^Expo(nent)?PushToken\[.+\]$/;

export function isExpoPushToken(token: string): boolean {
  return EXPO_PUSH_TOKEN_PATTERN.test(token);
}

export type PushReceipt = { status: string; details?: { error?: string } };

export function shouldClearTokenForReceipt(receipt: PushReceipt): boolean {
  return receipt.status === 'error' && receipt.details?.error === 'DeviceNotRegistered';
}

export type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  sound: 'default';
  data: PushEventData;
};

export function buildExpoPushMessage(token: string, event: PushEvent): ExpoPushMessage {
  const content = buildPushContent(event);
  return {
    to: token,
    title: content.title,
    body: content.body,
    sound: 'default',
    data: pushEventData(event),
  };
}
