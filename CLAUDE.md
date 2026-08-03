# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**arreglao** is a home-services marketplace app (React Native + Expo). The product shape:

- Users post job requests ("annonces") describing a need.
- Other users apply to those job requests; the poster picks a profile and starts a chat with them
  via an integrated in-app chat.
- Billing happens inside the app, and the app itself acts as an escrow between poster and worker
  (holds payment, releases it, mediates disputes).

None of this domain (annonces, applications, chat threads, transactions/escrow) is modeled yet.
Phone + OTP auth and a bare `profiles` table are wired up (see Architecture below); posting,
applying, chat, and credits/monetization are still unbuilt.

**Backend is decided: Supabase** (Postgres + Realtime + Auth), talked to directly from the client
via TanStack Query — there is no local SQLite/Drizzle cache and none should be reintroduced. Full
context on this and the rest of the MVP's decisions: [issue #1](https://github.com/bdauphouy/arreglao/issues/1)
(wayfinder map) and [issue #8](https://github.com/bdauphouy/arreglao/issues/8) (MVP spec).

## Commands

```bash
pnpm install              # install deps
pnpm expo start            # start the dev server (press i/a/w for iOS/Android/web)
pnpm ios / pnpm android / pnpm web   # start directly on a platform

pnpm lint                 # ESLint (eslint-config-expo)
pnpm format                # Prettier --write
pnpm format:check          # Prettier --check
pnpm typecheck              # tsc --noEmit
pnpm test                  # vitest run

supabase start              # run Postgres/Auth/Realtime/Storage locally (needs Docker)
supabase db reset            # re-apply supabase/migrations/ and supabase/seed.sql from scratch
```

Tests are Vitest, and currently cover pure logic only (e.g. `src/schemas/*`). Anything that talks
to Supabase (the `src/api/*` data-access layer) should be integration-tested against a real local
Supabase instance (`supabase start`) — not mocked — since RLS policies and Postgres constraints are
exactly what tends to break; see issue #8 for the reasoning.

MMKV is a native module, so **Expo Go will not work** — use the included `expo-dev-client`
(`eas build --profile development --platform ios|android`) to get a runnable client.

## Architecture

**Routing.** File-based routing via Expo Router under `app/`. Route groups: `(auth)` (phone + OTP
sign-in flow — real Supabase Auth, not a stub) and `(tabs)` (signed-in tab navigator, not built
yet). `app/index.tsx` does not redirect based on auth state yet — there's no auth-gated redirect
wired up (deliberately out of scope for the auth-foundation ticket; a future ticket decides where
signed-in vs. signed-out users land).

**Provider stack** (`app/_layout.tsx`), outside-in:
`Sentry.wrap` → `ErrorBoundary` → `SafeAreaProvider` → `PostHogProvider` (only mounted if
`EXPO_PUBLIC_POSTHOG_API_KEY` is set) → `QueryClientProvider` → `Stack`.

**Data/state has three distinct layers, used deliberately — don't blur them:**

- `src/lib/query-client.ts` (TanStack Query) — server state, talking to Supabase through the
  `src/api/*` data-access layer (never call `src/lib/supabase.ts`'s client directly from a screen).
- `src/stores/app-store.ts` (Zustand, persisted via `src/lib/storage.ts`/MMKV) — client/UI state
  only (theme, onboarding flags). Not for server or sensitive data.
- `expo-secure-store` — auth tokens/secrets only. The Supabase session itself is the one deliberate
  exception to "SecureStore only, nothing else": the session can exceed SecureStore's 2048-byte
  limit, so `src/lib/supabase.ts` encrypts it and stores the ciphertext in its own dedicated MMKV
  instance, keeping only the small AES key in SecureStore. See the comment in that file before
  changing the pattern.

**Backend** (`src/lib/supabase.ts`): a single Supabase client instance, session-persisted across
restarts. Schema lives in `supabase/migrations/` (SQL, checked in) and is applied via the Supabase
CLI (`supabase db reset` locally; `supabase db push` or the dashboard for a hosted project) — there
is no ORM and no client-side migration runner. `supabase/config.toml` configures local dev,
including a fixed test phone/OTP pair (`auth.sms.test_otp`) so sign-in can be exercised locally
without a real SMS provider.

**Env vars** (`src/lib/env.ts`): only `EXPO_PUBLIC_*`-prefixed vars are readable from client code
(inlined at build time by Expo) — `supabaseUrl`, `supabaseAnonKey`, `sentryDsn`, `posthogApiKey`,
`posthogHost`. Everything else (`EAS_PROJECT_ID`, `SENTRY_ORG`, `SENTRY_PROJECT`) is read only
inside `app.config.ts` at build/CI time and never reaches the client bundle.
