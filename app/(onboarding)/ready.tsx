import { Text, View } from 'react-native';

import { ONBOARDING_STEP_COUNT, useFinishOnboarding } from '../../src/lib/onboarding';
import { OnboardingScreen } from '../../src/components/onboarding-screen';

export default function ReadyScreen() {
  const finish = useFinishOnboarding();

  return (
    <OnboardingScreen
      step={3}
      totalSteps={ONBOARDING_STEP_COUNT}
      title="Todo listo"
      subtitle="Crea tu cuenta con tu correo. Sin contraseñas, sin complicaciones."
      ctaLabel="Comenzar"
      onNext={finish}
    >
      <View className="aspect-square w-full items-center justify-center gap-2 rounded-xl border border-olive-200 bg-white">
        <Text className="font-sans-extrabold text-2xl text-ink-900">Listo</Text>
        <Text className="font-sans text-sm text-olive-500">Tu cuenta está a un paso.</Text>
      </View>
    </OnboardingScreen>
  );
}
