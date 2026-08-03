/**
 * Public env vars must be prefixed with EXPO_PUBLIC_ and are inlined by Expo
 * at build time. Never put secrets here — this code ships in the client bundle.
 */
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  posthogApiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '',
  posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
};
