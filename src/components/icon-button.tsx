import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

type IconButtonTone = 'light' | 'glass' | 'solid';

type IconButtonProps = {
  tone?: IconButtonTone;
  active?: boolean;
  children: ReactNode;
  onPress: () => void;
};

const toneClasses: Record<IconButtonTone, string> = {
  light: 'bg-white shadow-sm',
  glass: 'bg-ink-900/55',
  solid: 'bg-ink-900',
};

export function IconButton({ tone = 'light', active = false, children, onPress }: IconButtonProps) {
  const background = tone === 'solid' && active ? 'bg-accent' : toneClasses[tone];

  return (
    <Pressable
      onPress={onPress}
      className={`h-10 w-10 items-center justify-center rounded-full active:scale-95 ${background}`}
    >
      {children}
    </Pressable>
  );
}
