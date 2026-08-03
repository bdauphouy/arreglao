import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-4">
      <Text className="text-xl font-semibold">Hello Arreglao</Text>
      <Pressable
        className="rounded-lg bg-black px-6 py-3"
        onPress={() => router.push("/(auth)/sign-in")}
      >
        <Text className="font-semibold text-white">Comenzar</Text>
      </Pressable>
    </View>
  );
}
