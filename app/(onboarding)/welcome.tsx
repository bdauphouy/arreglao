import { router } from 'expo-router';

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
    />
  );
}
