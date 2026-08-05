import '../global.css';

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as Sentry from '@sentry/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PostHogProvider } from 'posthog-react-native';
import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { env } from '../src/lib/env';
import { queryClient } from '../src/lib/query-client';
import { initSentry } from '../src/lib/sentry';
import { ErrorBoundary } from '../src/components/error-boundary';

initSentry();
SplashScreen.preventAutoHideAsync();

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
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <OptionalPostHogProvider>
            <QueryClientProvider client={queryClient}>
              <BottomSheetModalProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(onboarding)" options={{ animationTypeForReplace: 'pop' }} />
                </Stack>
              </BottomSheetModalProvider>
            </QueryClientProvider>
          </OptionalPostHogProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default env.sentryDsn ? Sentry.wrap(RootLayout) : RootLayout;
