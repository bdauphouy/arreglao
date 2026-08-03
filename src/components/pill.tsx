import type { PropsWithChildren } from 'react';
import { Pressable, Text } from 'react-native';

type PillProps = PropsWithChildren<{
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}>;

export function Pill({ selected, onPress, disabled, children }: PillProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-full border px-4 py-2 ${
        selected ? 'border-accent bg-accent' : 'border-olive-200 bg-white'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className={`font-sans-medium text-sm ${selected ? 'text-ink-900' : 'text-olive-700'}`}>
        {children}
      </Text>
    </Pressable>
  );
}
