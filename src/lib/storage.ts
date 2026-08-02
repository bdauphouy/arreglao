import { createMMKV } from 'react-native-mmkv';

/**
 * Non-sensitive preferences only (theme, UI flags, cached filters, etc).
 * Auth tokens and secrets belong in secure-store.ts instead.
 */
export const storage = createMMKV({ id: 'app-preferences' });
