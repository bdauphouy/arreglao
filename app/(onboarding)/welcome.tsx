import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { ONBOARDING_STEP_COUNT, useFinishOnboarding } from '../../src/lib/onboarding';
import { OnboardingScreen } from '../../src/components/onboarding-screen';

export default function WelcomeScreen() {
  const skip = useFinishOnboarding();

  return (
    <OnboardingScreen
      step={1}
      totalSteps={ONBOARDING_STEP_COUNT}
      title="Sé el poster: publica lo que necesitas"
      subtitle="Publica lo que necesitas arreglar y elige entre quienes quieren ayudarte."
      ctaLabel="Continuar"
      onNext={() => router.push('/(onboarding)/how-it-works')}
      onSkip={skip}
    >
      <View className="aspect-square w-full items-center justify-center rounded-xl border border-olive-200 bg-white">
        <Text className="font-sans-extrabold text-6xl text-ink-900">Arreglao</Text>
      </View>
    </OnboardingScreen>
  );
}
