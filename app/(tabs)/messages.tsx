import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  listConversations,
  listLatestMessagesForConversations,
  otherParticipant,
} from '../../src/api/conversations';
import { displayNameFor, getProfiles } from '../../src/api/profiles';
import { Avatar } from '../../src/components/avatar';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';

export default function MessagesScreen() {
  const meQuery = useCurrentProfile();
  const me = meQuery.data ?? null;

  const conversationsQuery = useQuery({
    queryKey: ['conversations', me?.id],
    queryFn: () => listConversations(me!.id),
    enabled: !!me,
  });

  const conversations = conversationsQuery.data ?? [];
  const conversationIds = conversations.map((conversation) => conversation.id);
  const otherIds = me
    ? conversations.map((conversation) => otherParticipant(conversation, me.id))
    : [];

  const latestMessagesQuery = useQuery({
    queryKey: ['conversations', 'latest-messages', conversationIds],
    queryFn: () => listLatestMessagesForConversations(conversationIds),
    enabled: conversationIds.length > 0,
  });

  const participantsQuery = useQuery({
    queryKey: ['profiles', otherIds],
    queryFn: () => getProfiles(otherIds),
    enabled: otherIds.length > 0,
  });

  const profileById = new Map(
    (participantsQuery.data ?? []).map((profile) => [profile.id, profile]),
  );

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <View className="px-6 pt-6">
        <Text className="font-sans-extrabold text-3xl text-ink-900">Mensajes</Text>
      </View>

      <FlatList
        data={me ? conversations : []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="gap-1 px-6 py-6"
        ListEmptyComponent={
          conversationsQuery.isLoading ? null : (
            <Text className="font-sans text-base text-olive-600">
              Todavía no tienes conversaciones.
            </Text>
          )
        }
        renderItem={({ item }) => {
          const profile = me ? profileById.get(otherParticipant(item, me.id)) : undefined;
          const lastMessage = latestMessagesQuery.data?.get(item.id);
          return (
            <Pressable
              onPress={() => router.push(`/messages/${item.id}`)}
              className="flex-row items-center gap-3 border-b border-olive-100 py-3"
            >
              <Avatar
                src={profile?.avatarUrl}
                initials={profile ? displayNameFor(profile).charAt(0).toUpperCase() || '?' : '?'}
                size={48}
              />
              <View className="flex-1">
                <Text className="font-sans-semibold text-base text-ink-900">
                  {profile ? displayNameFor(profile) : 'Cargando…'}
                </Text>
                <Text numberOfLines={1} className="font-sans text-sm text-olive-600">
                  {lastMessage?.body ?? 'Sin mensajes todavía'}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
