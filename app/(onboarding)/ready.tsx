import { router } from 'expo-router';

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
      onBack={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(onboarding)/how-it-works');
        }
      }}
    />
  );
}
