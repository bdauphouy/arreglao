import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Image, View } from 'react-native';

type CardProps = {
  photo?: string;
  children?: ReactNode;
  className?: string;
};

export function Card({ photo, children, className }: CardProps) {
  if (photo) {
    return (
      <View className={`overflow-hidden rounded-lg ${className ?? ''}`}>
        <Image
          source={{ uri: photo }}
          className="absolute inset-0 h-full w-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(20,23,15,0)', 'rgba(20,23,15,0.75)']}
          locations={[0.4, 1]}
          className="absolute inset-0"
        />
        <View className="p-4">{children}</View>
      </View>
    );
  }

  return (
    <View className={`rounded-md border border-olive-200 bg-white p-4 ${className ?? ''}`}>
      {children}
    </View>
  );
}
