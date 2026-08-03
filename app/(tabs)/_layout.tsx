import { Tabs, router } from 'expo-router';
import { Home, Plus, User } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

function PublishTabButton() {
  return (
    <View className="flex-1 items-center">
      <Pressable
        onPress={() => router.push('/annonces/new')}
        className="-mt-6 h-14 w-14 items-center justify-center rounded-full bg-accent active:bg-accent-active"
      >
        <Plus color="#14170F" size={28} strokeWidth={2.25} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#14170F',
        tabBarInactiveTintColor: '#9C9877',
        tabBarStyle: { backgroundColor: '#F7F5EE', borderTopColor: '#D8D5C0' },
        tabBarLabelStyle: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="publish"
        options={{
          title: '',
          tabBarButton: PublishTabButton,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
