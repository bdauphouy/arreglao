import { Minus, Plus } from 'lucide-react-native';
import { Pressable, Text, TextInput, View } from 'react-native';

import {
  clampRadiusKm,
  parseRadiusInput,
  QUICK_PICK_RADII_KM,
  RADIUS_STEP_KM,
} from '../lib/radius';
import { Pill } from './pill';

type RadiusStepperProps = {
  value: number;
  onChange: (value: number) => void;
  quickPicks?: readonly number[];
};

export function RadiusStepper({
  value,
  onChange,
  quickPicks = QUICK_PICK_RADII_KM,
}: RadiusStepperProps) {
  const adjust = (delta: number) => onChange(clampRadiusKm(value + delta));

  return (
    <View className="gap-2">
      <View className="flex-row items-center self-start gap-1 rounded-full border border-olive-200 bg-white py-1 pl-1 pr-3">
        <Pressable
          onPress={() => adjust(-RADIUS_STEP_KM)}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-olive-50"
        >
          <Minus size={18} color="#14170F" />
        </Pressable>
        <View className="flex-row items-center">
          <TextInput
            value={String(value)}
            onChangeText={(text) => onChange(parseRadiusInput(text))}
            keyboardType="numeric"
            className="min-w-10 p-0 text-right font-sans-extrabold text-2xl leading-tight text-ink-900"
            style={{ includeFontPadding: false, textAlignVertical: 'center' }}
          />
          <Text className="font-sans-extrabold text-2xl leading-tight text-ink-900"> km</Text>
        </View>
        <Pressable
          onPress={() => adjust(RADIUS_STEP_KM)}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-olive-50"
        >
          <Plus size={18} color="#14170F" />
        </Pressable>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {quickPicks.map((km) => (
          <Pill key={km} selected={value === km} onPress={() => onChange(km)}>
            {km} km
          </Pill>
        ))}
      </View>
    </View>
  );
}
