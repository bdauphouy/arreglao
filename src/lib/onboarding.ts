import { router } from 'expo-router';

import { useAppStore } from '../stores/app-store';

export const ONBOARDING_STEP_COUNT = 3;

export function useFinishOnboarding() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  return () => {
    completeOnboarding();
    router.replace('/(auth)/sign-in');
  };
}
