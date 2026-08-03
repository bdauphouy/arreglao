import type { ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onPress: () => void;
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2',
  md: 'px-6 py-3',
  lg: 'px-6 py-4',
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
};

const variantClasses: Record<ButtonVariant, { container: string; pressed: string; text: string }> =
  {
    primary: { container: 'bg-accent', pressed: 'active:bg-accent-active', text: 'text-ink-900' },
    secondary: { container: 'bg-ink-900', pressed: 'active:opacity-90', text: 'text-white' },
    outline: {
      container: 'border border-olive-900 bg-white',
      pressed: 'active:bg-olive-50',
      text: 'text-ink-900',
    },
    ghost: { container: 'bg-transparent', pressed: 'active:bg-olive-50', text: 'text-ink-900' },
  };

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  children,
  onPress,
}: ButtonProps) {
  const v = variantClasses[variant];

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      className={`flex-row items-center justify-center gap-2 rounded-full ${sizeClasses[size]} ${v.container} ${
        disabled ? 'opacity-45' : v.pressed
      }`}
    >
      {icon}
      <Text className={`font-sans-semibold ${textSizeClasses[size]} ${v.text}`}>{children}</Text>
    </Pressable>
  );
}
