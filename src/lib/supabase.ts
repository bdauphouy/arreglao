import { createClient } from '@supabase/supabase-js';
import * as aesjs from 'aes-js';
import { getRandomBytesAsync } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

import { env } from './env';

/**
 * expo-secure-store rejects values over 2048 bytes, which a Supabase session
 * (access + refresh token) can exceed. So the session ciphertext lives in its
 * own MMKV instance (fast, no size limit) and only the small AES key — the
 * only part that actually needs to be secret — lives in SecureStore. Mirrors
 * Supabase's own documented pattern for Expo, substituting MMKV for
 * AsyncStorage since this repo already standardizes on MMKV for local
 * key/value storage: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
 */
const sessionCache = createMMKV({ id: 'supabase-auth-session' });

class LargeSecureStore {
  private async encrypt(key: string, value: string): Promise<string> {
    const encryptionKey = await getRandomBytesAsync(32);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));

    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async decrypt(key: string, value: string): Promise<string | null> {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) {
      return null;
    }

    const cipher = new aesjs.ModeOfOperation.ctr(
      aesjs.utils.hex.toBytes(encryptionKeyHex),
      new aesjs.Counter(1),
    );
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));

    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string): Promise<string | null> {
    const encrypted = sessionCache.getString(key);
    if (!encrypted) {
      return null;
    }

    return this.decrypt(key, encrypted);
  }

  async removeItem(key: string): Promise<void> {
    sessionCache.remove(key);
    await SecureStore.deleteItemAsync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await this.encrypt(key, value);
    sessionCache.set(key, encrypted);
  }
}

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: new LargeSecureStore(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// The auto-refresh timer keeps firing network requests in the background
// unless it's told to pause — tie it to app foreground/background state, per
// Supabase's own React Native guidance.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
