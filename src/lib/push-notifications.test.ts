import { describe, expect, it } from 'vitest';

import {
  buildExpoPushMessage,
  buildPushContent,
  isExpoPushToken,
  pushEventData,
  routeForPushData,
  shouldClearTokenForReceipt,
  type PushEvent,
} from './push-notifications';

const applicationReceived: PushEvent = {
  type: 'application_received',
  annonceId: 'annonce-1',
  annonceTitle: 'Arreglar fuga de agua',
  applicantName: 'Maria',
};

const applicationAccepted: PushEvent = {
  type: 'application_accepted',
  annonceId: 'annonce-1',
  annonceTitle: 'Arreglar fuga de agua',
  conversationId: 'conversation-1',
};

const annonceSaved: PushEvent = {
  type: 'annonce_saved',
  annonceId: 'annonce-1',
  annonceTitle: 'Arreglar fuga de agua',
};

const messageReceived: PushEvent = {
  type: 'message_received',
  conversationId: 'conversation-1',
  senderName: 'Carlos',
  messagePreview: '¿Sigues disponible mañana?',
};

describe('buildPushContent', () => {
  it('describes a new application in Spanish, naming the applicant and the post', () => {
    const content = buildPushContent(applicationReceived);
    expect(content.title).toBe('Nueva postulación');
    expect(content.body).toContain('Maria');
    expect(content.body).toContain('Arreglar fuga de agua');
  });

  it('tells the applicant they were chosen', () => {
    const content = buildPushContent(applicationAccepted);
    expect(content.title).toBe('¡Fuiste elegido!');
    expect(content.body).toContain('Arreglar fuga de agua');
  });

  it('tells the poster someone saved their post', () => {
    const content = buildPushContent(annonceSaved);
    expect(content.title).toBe('Nuevo guardado');
    expect(content.body).toContain('Arreglar fuga de agua');
  });

  it('previews a new chat message with the sender name', () => {
    const content = buildPushContent(messageReceived);
    expect(content.title).toBe('Carlos');
    expect(content.body).toBe('¿Sigues disponible mañana?');
  });
});

describe('pushEventData', () => {
  it('carries the annonce id for application_received', () => {
    expect(pushEventData(applicationReceived)).toEqual({
      type: 'application_received',
      annonceId: 'annonce-1',
    });
  });

  it('carries the conversation id for application_accepted', () => {
    expect(pushEventData(applicationAccepted)).toEqual({
      type: 'application_accepted',
      conversationId: 'conversation-1',
    });
  });

  it('carries the annonce id for annonce_saved', () => {
    expect(pushEventData(annonceSaved)).toEqual({
      type: 'annonce_saved',
      annonceId: 'annonce-1',
    });
  });

  it('carries the conversation id for message_received', () => {
    expect(pushEventData(messageReceived)).toEqual({
      type: 'message_received',
      conversationId: 'conversation-1',
    });
  });
});

describe('routeForPushData', () => {
  it('routes application_received to the annonce', () => {
    expect(routeForPushData({ type: 'application_received', annonceId: 'annonce-1' })).toEqual({
      screen: 'annonce',
      id: 'annonce-1',
    });
  });

  it('routes annonce_saved to the annonce', () => {
    expect(routeForPushData({ type: 'annonce_saved', annonceId: 'annonce-1' })).toEqual({
      screen: 'annonce',
      id: 'annonce-1',
    });
  });

  it('routes application_accepted to the conversation', () => {
    expect(
      routeForPushData({ type: 'application_accepted', conversationId: 'conversation-1' }),
    ).toEqual({ screen: 'conversation', id: 'conversation-1' });
  });

  it('routes message_received to the conversation', () => {
    expect(
      routeForPushData({ type: 'message_received', conversationId: 'conversation-1' }),
    ).toEqual({ screen: 'conversation', id: 'conversation-1' });
  });

  it('returns null for an unknown type', () => {
    expect(routeForPushData({ type: 'something_else' })).toBeNull();
  });

  it('returns null when the expected id is missing', () => {
    expect(routeForPushData({ type: 'message_received' })).toBeNull();
  });
});

describe('isExpoPushToken', () => {
  it('accepts a well-formed ExponentPushToken', () => {
    expect(isExpoPushToken('ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]')).toBe(true);
  });

  it('accepts a well-formed ExpoPushToken', () => {
    expect(isExpoPushToken('ExpoPushToken[xxxxxxxxxxxxxxxxxxxxxx]')).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(isExpoPushToken('')).toBe(false);
  });

  it('rejects an arbitrary string', () => {
    expect(isExpoPushToken('not-a-push-token')).toBe(false);
  });
});

describe('shouldClearTokenForReceipt', () => {
  it('does not clear the token for an ok receipt', () => {
    expect(shouldClearTokenForReceipt({ status: 'ok' })).toBe(false);
  });

  it('clears the token when Expo reports DeviceNotRegistered', () => {
    expect(
      shouldClearTokenForReceipt({
        status: 'error',
        details: { error: 'DeviceNotRegistered' },
      }),
    ).toBe(true);
  });

  it('does not clear the token for other error reasons', () => {
    expect(
      shouldClearTokenForReceipt({ status: 'error', details: { error: 'MessageTooBig' } }),
    ).toBe(false);
  });

  it('does not clear the token when the error reason is missing', () => {
    expect(shouldClearTokenForReceipt({ status: 'error' })).toBe(false);
  });
});

describe('buildExpoPushMessage', () => {
  it('composes the Expo push API payload from a token and an event', () => {
    expect(buildExpoPushMessage('ExponentPushToken[xxx]', messageReceived)).toEqual({
      to: 'ExponentPushToken[xxx]',
      title: 'Carlos',
      body: '¿Sigues disponible mañana?',
      sound: 'default',
      data: { type: 'message_received', conversationId: 'conversation-1' },
    });
  });
});
