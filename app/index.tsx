import { Redirect } from 'expo-router';

import { useCurrentProfile } from '../src/hooks/use-current-profile';
import { useAppStore } from '../src/stores/app-store';

export default function Index() {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const profileQuery = useCurrentProfile();

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  if (profileQuery.isLoading) {
    return null;
  }

  if (!profileQuery.data) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!profileQuery.data.firstName) {
    return <Redirect href="/(auth)/profile-details" />;
  }

  return <Redirect href="/(tabs)" />;
}
