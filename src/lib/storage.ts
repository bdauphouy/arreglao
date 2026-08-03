import { createMMKV } from 'react-native-mmkv';

/**
 * Non-sensitive preferences only (theme, UI flags, cached filters, etc).
 * Auth tokens and secrets belong in SecureStore instead (see src/lib/supabase.ts).
 */
export const storage = createMMKV({ id: 'app-preferences' });
