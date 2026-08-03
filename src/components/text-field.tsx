import type { ComponentProps } from 'react';
import { TextInput, View } from 'react-native';

type TextFieldProps = ComponentProps<typeof TextInput>;

export function TextField({ className, ...props }: TextFieldProps) {
  return (
    <View className="h-12 flex-row items-center rounded-md border border-olive-200 bg-white px-4">
      <TextInput
        placeholderTextColor="#9C9877"
        className={`flex-1 font-sans p-0 text-base leading-tight text-ink-900 ${className ?? ''}`}
        {...props}
      />
    </View>
  );
}
