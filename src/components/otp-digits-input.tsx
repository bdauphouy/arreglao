import { useRef } from 'react';
import { TextInput, View } from 'react-native';

type OtpDigitsInputProps = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
};

export function OtpDigitsInput({ length = 6, value, onChange }: OtpDigitsInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  const setDigit = (index: number, text: string) => {
    const incoming = text.replace(/\D/g, '');

    if (incoming.length > 1) {
      const next = value.split('');
      incoming
        .slice(0, length - index)
        .split('')
        .forEach((char, offset) => {
          next[index + offset] = char;
        });
      const merged = next.join('').slice(0, length);
      onChange(merged);
      inputRefs.current[Math.min(index + incoming.length, length - 1)]?.focus();
      return;
    }

    const next = digits.slice();
    next[index] = incoming;
    onChange(next.join(''));

    if (incoming && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-between gap-2">
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          className="font-sans-semibold h-14 flex-1 rounded-full border border-olive-900 bg-white text-center text-lg leading-tight text-ink-900"
          autoFocus={index === 0}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={length}
          selectTextOnFocus
          value={digit}
          onChangeText={(text) => setDigit(index, text)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
        />
      ))}
    </View>
  );
}
