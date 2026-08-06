import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  listConversations,
  listLatestMessagesForConversations,
  otherParticipant,
  subscribeToMessageChanges,
} from '../../src/api/conversations';
import { displayNameFor, getProfiles } from '../../src/api/profiles';
import { Avatar } from '../../src/components/avatar';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';

export default function MessagesScreen() {
  const meQuery = useCurrentProfile();
  const me = meQuery.data ?? null;
  const meId = me?.id;
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: ['conversations', me?.id],
    queryFn: () => listConversations(me!.id),
    enabled: !!me,
  });

  useEffect(() => {
    if (!meId) {
      return;
    }
    // A new conversation (someone applying with a message, or a poster
    // assigning a helper) surfaces as a message insert — invalidating on
    // any message change picks up both new conversations and new previews
    // without the poster having to manually refresh. See
    // subscribeToMessageChanges's own comment for why this channel is
    // unscoped and RLS-safe.
    const channel = subscribeToMessageChanges(() => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
    return () => {
      channel.unsubscribe();
    };
  }, [meId, queryClient]);

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
    <SafeAreaView className="flex-1 bg-sand" edges={['top', 'left', 'right']}>
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
          const isUnread =
            !!me &&
            !!lastMessage &&
            lastMessage.senderId !== me.id &&
            lastMessage.status === 'unread';
          return (
            <Pressable
              onPress={() => router.push(`/messages/${item.id}`)}
              className={`flex-row items-center gap-3 border-b border-olive-100 py-3 ${isUnread ? 'bg-accent/10' : ''}`}
            >
              <Avatar
                src={profile?.avatarUrl}
                initials={profile ? displayNameFor(profile).charAt(0).toUpperCase() || '?' : '?'}
                size={48}
              />
              <View className="flex-1">
                <Text
                  className={`text-base text-ink-900 ${isUnread ? 'font-sans-bold' : 'font-sans-semibold'}`}
                >
                  {profile ? displayNameFor(profile) : 'Cargando…'}
                </Text>
                <Text
                  numberOfLines={1}
                  className={`text-sm ${isUnread ? 'font-sans-semibold text-ink-900' : 'font-sans text-olive-600'}`}
                >
                  {lastMessage?.body ?? 'Sin mensajes todavía'}
                </Text>
              </View>
              {isUnread ? <View className="h-2.5 w-2.5 rounded-full bg-accent" /> : null}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
