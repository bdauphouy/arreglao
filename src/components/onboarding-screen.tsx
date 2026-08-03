import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from './button';

type OnboardingScreenProps = PropsWithChildren<{
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  ctaLabel: string;
  onNext: () => void;
  onSkip?: () => void;
}>;

export function OnboardingScreen({
  step,
  totalSteps,
  title,
  subtitle,
  ctaLabel,
  onNext,
  onSkip,
  children,
}: OnboardingScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-sand">
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center"
        >
          <ArrowLeft size={22} strokeWidth={1.75} color="#14170F" />
        </Pressable>

        <View className="flex-row gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              className={`h-2 w-2 rounded-full ${index === step - 1 ? 'bg-accent' : 'bg-olive-200'}`}
            />
          ))}
        </View>

        {onSkip ? (
          <Pressable onPress={onSkip} hitSlop={8}>
            <Text className="font-sans-medium text-sm text-olive-600">Omitir</Text>
          </Pressable>
        ) : (
          <View className="h-8 w-8" />
        )}
      </View>

      <View className="flex-1 items-center justify-center px-6">{children}</View>

      <View className="gap-3 px-6 pb-4">
        <Text className="font-sans-extrabold text-3xl text-ink-900">{title}</Text>
        <Text className="font-sans text-base text-olive-600">{subtitle}</Text>
      </View>

      <View className="px-6 pb-6">
        <Button size="lg" onPress={onNext}>
          {ctaLabel}
        </Button>
      </View>
    </SafeAreaView>
  );
}
