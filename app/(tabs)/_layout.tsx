import { Tabs, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Home, Map, MessageCircle, Plus, Users } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useUnreadMessagesCount } from '../../src/hooks/use-unread-messages-count';

function PublishTabButton() {
  return (
    <View className="flex-1 items-center">
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/annonces/new');
        }}
        className="-mt-6 h-14 w-14 items-center justify-center rounded-full bg-accent active:bg-accent-active"
      >
        <Plus color="#14170F" size={28} strokeWidth={2.25} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  const unreadCount = useUnreadMessagesCount();

  return (
    <Tabs
      screenListeners={{
        tabPress: () => Haptics.selectionAsync(),
      }}
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
        name="joblist"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
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
        name="helpers"
        options={{
          title: 'Ayudantes',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mensajes',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#C1473B' },
        }}
      />
      <Tabs.Screen name="account" options={{ href: null }} />
    </Tabs>
  );
}
