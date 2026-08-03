import { Image, Text, View } from 'react-native';

type AvatarProps = {
  src?: string | null;
  initials: string;
  size?: number;
  ring?: boolean;
};

export function Avatar({ src, initials, size = 40, ring = false }: AvatarProps) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`items-center justify-center overflow-hidden bg-olive-200 ${ring ? 'border-2 border-accent' : ''}`}
    >
      {src ? (
        <Image source={{ uri: src }} style={{ width: size, height: size }} resizeMode="cover" />
      ) : (
        <Text className="font-sans-bold text-ink-900" style={{ fontSize: size * 0.38 }}>
          {initials}
        </Text>
      )}
    </View>
  );
}
