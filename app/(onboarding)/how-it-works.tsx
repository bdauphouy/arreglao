import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { ONBOARDING_STEP_COUNT, useFinishOnboarding } from '../../src/lib/onboarding';
import { OnboardingScreen } from '../../src/components/onboarding-screen';

const STEPS = [
  { number: '1', label: 'Publica tu annonce con lo que necesitas.' },
  { number: '2', label: 'Los applicants te muestran interés.' },
  { number: '3', label: 'Elige al helper que más te convenga.' },
  { number: '4', label: 'Se resuelve y listo.' },
];

export default function HowItWorksScreen() {
  const skip = useFinishOnboarding();

  return (
    <OnboardingScreen
      step={2}
      totalSteps={ONBOARDING_STEP_COUNT}
      title="Así funciona"
      subtitle="Publica, revisa quién aplicó y elige. Tú decides."
      ctaLabel="Continuar"
      onNext={() => router.push('/(onboarding)/ready')}
      onSkip={skip}
    >
      <View className="w-full gap-3">
        {STEPS.map((step) => (
          <View
            key={step.number}
            className="flex-row items-center gap-3 rounded-md border border-olive-200 bg-white px-4 py-3"
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-accent">
              <Text className="font-sans-bold text-sm text-ink-900">{step.number}</Text>
            </View>
            <Text className="font-sans-medium flex-1 text-sm text-ink-900">{step.label}</Text>
          </View>
        ))}
      </View>
    </OnboardingScreen>
  );
}
