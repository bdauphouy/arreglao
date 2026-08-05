import type { ComponentProps } from 'react';
import { TextInput, View } from 'react-native';

type TextFieldProps = ComponentProps<typeof TextInput>;

export function TextField({ className, ...props }: TextFieldProps) {
  return (
    <View className="h-14 flex-row items-center rounded-full border border-olive-200 bg-white px-6">
      <TextInput
        placeholderTextColor="#9C9877"
        className={`flex-1 font-sans p-0 text-base leading-tight text-ink-900 ${className ?? ''}`}
        {...props}
      />
    </View>
  );
}
