import { Pressable, View } from 'react-native';

type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function Switch({ value, onValueChange, disabled }: SwitchProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      className={`h-8 w-14 justify-center rounded-full px-1 ${value ? 'bg-accent' : 'bg-olive-200'} ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <View className={`h-6 w-6 rounded-full bg-white ${value ? 'self-end' : 'self-start'}`} />
    </Pressable>
  );
}
