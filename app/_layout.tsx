import '../global.css';

import * as Sentry from '@sentry/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { PostHogProvider } from 'posthog-react-native';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { env } from '../src/lib/env';
import { queryClient } from '../src/lib/query-client';
import { initSentry } from '../src/lib/sentry';
import { ErrorBoundary } from '../src/components/error-boundary';

initSentry();

function OptionalPostHogProvider({ children }: PropsWithChildren) {
  if (!env.posthogApiKey) {
    return children;
  }

  return (
    <PostHogProvider
      apiKey={env.posthogApiKey}
      options={{ host: env.posthogHost, enableSessionReplay: false }}
    >
      {children}
    </PostHogProvider>
  );
}

function RootLayout() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <OptionalPostHogProvider>
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }} />
          </QueryClientProvider>
        </OptionalPostHogProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default env.sentryDsn ? Sentry.wrap(RootLayout) : RootLayout;
