import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Image, Pressable, Text } from 'react-native';

type AvatarPickerProps = {
  avatarUrl: string | null;
  onPick: (base64: string) => void | Promise<void>;
  uploading?: boolean;
};

export function AvatarPicker({ avatarUrl, onPick, uploading }: AvatarPickerProps) {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]?.base64) {
      await onPick(result.assets[0].base64);
    }
  };

  return (
    <Pressable
      onPress={pickImage}
      disabled={uploading}
      className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-olive-200 bg-white"
    >
      {uploading ? (
        <ActivityIndicator color="#5E5C49" />
      ) : avatarUrl ? (
        <Image source={{ uri: avatarUrl }} className="h-24 w-24" />
      ) : (
        <Text className="font-sans-medium text-center text-xs text-olive-500">Elegir foto</Text>
      )}
    </Pressable>
  );
}
