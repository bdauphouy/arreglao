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

None of this domain (annonces, applications, chat threads, transactions/escrow) is modeled yet —
the current codebase is still the generic scaffold described below. The only domain-shaped code so
far is a placeholder `tasks` table/screen left over from the template; treat it as throwaway, not a
pattern to extend.

**Open architectural question, not yet decided:** the app currently reads/writes Expo SQLite
directly as if it were the sole data store (see `src/db/index.ts`). Escrow and billing are
inherently server-authoritative (money movement has to go through a licensed payment/escrow
provider — e.g. Stripe Connect — with server-side webhooks and a transaction ledger; it cannot live
on-device), and chat needs a realtime transport that doesn't exist in the stack yet. Before
building those features, decide whether Drizzle/SQLite stays as an offline cache in front of a
real backend API, or gets removed in favor of TanStack Query talking directly to a server. Don't
extend the current "SQLite as backend" pattern into new features without settling this first.

## Commands

```bash
pnpm install              # install deps
pnpm expo start            # start the dev server (press i/a/w for iOS/Android/web)
pnpm ios / pnpm android / pnpm web   # start directly on a platform

pnpm lint                 # ESLint (eslint-config-expo)
pnpm format                # Prettier --write
pnpm format:check          # Prettier --check
pnpm typecheck              # tsc --noEmit

pnpm db:generate            # generate a Drizzle migration from src/db/schema.ts
pnpm db:migrate             # run drizzle-kit migrate
pnpm db:studio              # open Drizzle Studio against the local schema
```

There is no test script configured yet.

MMKV is a native module, so **Expo Go will not work** — use the included `expo-dev-client`
(`eas build --profile development --platform ios|android`) to get a runnable client.

## Architecture

**Routing.** File-based routing via Expo Router under `app/`. Route groups: `(auth)` (sign-in
flow, no auth guard logic yet — `saveAuthToken` is a stub that doesn't call a real backend) and
`(tabs)` (signed-in tab navigator). `app/index.tsx` redirects to `(tabs)` unconditionally — there's
no auth-gated redirect wired up yet.

**Provider stack** (`app/_layout.tsx`), outside-in:
`Sentry.wrap` → `ErrorBoundary` → `SafeAreaProvider` → `PostHogProvider` (only mounted if
`EXPO_PUBLIC_POSTHOG_API_KEY` is set) → `QueryClientProvider` → `DbProvider` → `Stack`.
`DbProvider` (`src/db/provider.tsx`) blocks rendering of children until Drizzle's `useMigrations`
finishes applying pending SQL migrations, showing a loading/error screen in the meantime.

**Data/state has three distinct layers, used deliberately — don't blur them:**
- `src/lib/query-client.ts` (TanStack Query) — server state.
- `src/stores/app-store.ts` (Zustand, persisted via `src/lib/storage.ts`/MMKV) — client/UI state
  only (theme, onboarding flags). Not for server or sensitive data.
- `src/lib/secure-store.ts` (expo-secure-store) — auth tokens/secrets only.

**Local DB** (`src/db/`): Drizzle ORM over `expo-sqlite`. Schema in `src/db/schema.ts`; after
editing it, run `pnpm db:generate` to emit SQL into `drizzle/` (checked in), which
`DbProvider` applies automatically on app start — migrations are never run manually against a
device/simulator.

**Env vars** (`src/lib/env.ts`): only `EXPO_PUBLIC_*`-prefixed vars are readable from client code
(inlined at build time by Expo) — `apiUrl`, `sentryDsn`, `posthogApiKey`, `posthogHost`. Everything
else (`EAS_PROJECT_ID`, `SENTRY_ORG`, `SENTRY_PROJECT`) is read only inside `app.config.ts` at
build/CI time and never reaches the client bundle.

**Metro config customizations** (`metro.config.js`) exist for two reasons — don't remove without
understanding why: `.sql` is added to `sourceExts` because Drizzle's generated migrations import
raw `.sql` files (paired with the `inline-import` Babel plugin in `babel.config.js`); `.wasm` is
added to `assetExts` and COOP/COEP headers are set because `expo-sqlite` on web runs on
`wa-sqlite` (WASM), which requires `SharedArrayBuffer`.
