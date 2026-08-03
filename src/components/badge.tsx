import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent';

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
};

const toneClasses: Record<BadgeTone, { container: string; text: string }> = {
  neutral: { container: 'bg-olive-100', text: 'text-ink-900' },
  success: { container: 'bg-success-bg', text: 'text-success' },
  warning: { container: 'bg-warning-bg', text: 'text-warning' },
  danger: { container: 'bg-danger-bg', text: 'text-danger' },
  info: { container: 'bg-info-bg', text: 'text-info' },
  accent: { container: 'bg-accent', text: 'text-ink-900' },
};

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  const t = toneClasses[tone];

  return (
    <View
      className={`flex-row items-center gap-1 self-start rounded-full px-2.5 py-1 ${t.container}`}
    >
      <Text className={`font-sans-bold text-xs ${t.text}`}>{children}</Text>
    </View>
  );
}
