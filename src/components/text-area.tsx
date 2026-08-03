import type { ComponentProps } from 'react';
import { TextInput, View } from 'react-native';

type TextAreaProps = ComponentProps<typeof TextInput>;

export function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <View className="h-28 rounded-md border border-olive-200 bg-white p-4">
      <TextInput
        placeholderTextColor="#9C9877"
        multiline
        textAlignVertical="top"
        className={`flex-1 font-sans text-base leading-tight text-ink-900 ${className ?? ''}`}
        {...props}
      />
    </View>
  );
}
