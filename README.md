# arreglao

Production-ready Expo scaffold: Expo Router, TanStack Query, Zustand, React Hook Form + Zod,
Expo SQLite + Drizzle, MMKV, Secure Store, Sentry, and PostHog.

## Stack

- **Expo** (managed workflow, TypeScript, new architecture)
- **Expo Router** — file-based navigation (`app/`)
- **TanStack Query** — server state (`src/lib/query-client.ts`)
- **Zustand** — client/UI state, persisted to MMKV (`src/stores/app-store.ts`)
- **React Hook Form + Zod** — forms and validation (`src/schemas/`)
- **Expo SQLite + Drizzle ORM** — local database (`src/db/`)
- **react-native-mmkv** — fast key-value storage for non-sensitive prefs (`src/lib/storage.ts`)
- **expo-secure-store** — auth tokens and secrets (`src/lib/secure-store.ts`)
- **Sentry** — crash/error reporting (`src/lib/sentry.ts`)
- **PostHog** — product analytics (wired in `app/_layout.tsx`)
- **EAS** — build and update config (`eas.json`)
- **ESLint + Prettier** — linting and formatting

## Getting started

```bash
pnpm install
pnpm expo start
```

Press `i` / `a` / `w` to open iOS Simulator, Android Emulator, or the web build.

MMKV requires a native module, so **Expo Go will not work** — `expo-dev-client` is already
included, so build a development client once:

```bash
eas build --profile development --platform ios   # or android
```

## Environment variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

- Variables prefixed `EXPO_PUBLIC_` are inlined into the client bundle at build time (Sentry DSN,
  PostHog key, API URL). They are public — never put secrets in them.
- `EAS_PROJECT_ID`, `SENTRY_ORG`, `SENTRY_PROJECT` are read only by `app.config.ts` at build/CI
  time and are not shipped to the client.

## Local database (Drizzle + Expo SQLite)

The schema lives in `src/db/schema.ts`. After changing it, generate a migration:

```bash
pnpm db:generate
```

Migrations are bundled into the app and applied automatically on startup via `useMigrations` in
`src/db/provider.tsx`. `pnpm db:studio` opens Drizzle Studio against the schema for inspection.

## Project structure

```
app/                  Expo Router routes
  _layout.tsx          Root layout: providers, error boundary, DB migrations
  index.tsx            Redirects to (tabs)
  (tabs)/              Signed-in tab navigator
  (auth)/              Sign-in flow
src/
  components/          Shared UI (error boundary, etc.)
  db/                   Drizzle schema, client, migration provider
  lib/                  query-client, storage, secure-store, sentry, env
  schemas/              Zod schemas for forms
  stores/               Zustand stores
drizzle/               Generated SQL migrations (checked in)
```

## EAS builds

Three profiles are configured in `eas.json`: `development`, `preview`, `production`.

```bash
eas build --profile preview --platform all
eas update --branch preview   # push an OTA update to a channel
```

## Scripts

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `pnpm expo start`  | Start the dev server           |
| `pnpm lint`        | Lint with ESLint               |
| `pnpm format`      | Format with Prettier           |
| `pnpm typecheck`   | Type-check with `tsc --noEmit` |
| `pnpm db:generate` | Generate a Drizzle migration   |
| `pnpm db:studio`   | Open Drizzle Studio            |
