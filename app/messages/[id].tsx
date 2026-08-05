import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getConversation,
  listMessages,
  otherParticipant,
  sendMessage,
  subscribeToMessages,
  type Message,
} from '../../src/api/conversations';
import { displayNameFor, getProfile } from '../../src/api/profiles';
import { Avatar } from '../../src/components/avatar';
import { IconButton } from '../../src/components/icon-button';
import { TextField } from '../../src/components/text-field';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const meQuery = useCurrentProfile();
  const me = meQuery.data ?? null;
  const [draft, setDraft] = useState('');

  const conversationQuery = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => getConversation(id),
    enabled: !!id,
  });

  const otherId =
    me && conversationQuery.data ? otherParticipant(conversationQuery.data, me.id) : null;

  const otherProfileQuery = useQuery({
    queryKey: ['profile', otherId],
    queryFn: () => getProfile(otherId!),
    enabled: !!otherId,
  });

  const messagesQuery = useQuery({
    queryKey: ['messages', id],
    queryFn: () => listMessages(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) {
      return;
    }

    const appendMessage = (message: Message) => {
      queryClient.setQueryData<Message[]>(['messages', id], (old) => {
        if (!old) {
          return [message];
        }
        if (old.some((existing) => existing.id === message.id)) {
          return old;
        }
        return [...old, message];
      });
    };

    const channel = subscribeToMessages(id, appendMessage);
    return () => {
      channel.unsubscribe();
    };
  }, [id, queryClient]);

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(id, me!.id, draft.trim()),
    onSuccess: (message) => {
      queryClient.setQueryData<Message[]>(['messages', id], (old) => {
        if (!old) {
          return [message];
        }
        if (old.some((existing) => existing.id === message.id)) {
          return old;
        }
        return [...old, message];
      });
      setDraft('');
    },
  });

  const messages = messagesQuery.data ?? [];
  const otherName = otherProfileQuery.data ? displayNameFor(otherProfileQuery.data) : 'Cargando…';

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <View className="flex-row items-center gap-3 border-b border-olive-100 px-6 pb-4 pt-6">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center"
        >
          <ArrowLeft size={22} strokeWidth={1.75} color="#14170F" />
        </Pressable>
        <Avatar
          src={otherProfileQuery.data?.avatarUrl}
          initials={otherName.charAt(0).toUpperCase() || '?'}
          size={36}
        />
        <Text className="font-sans-semibold text-base text-ink-900">{otherName}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-2 px-6 py-4"
          renderItem={({ item }) => {
            const isMine = item.senderId === me?.id;
            return (
              <View className={`max-w-[80%] ${isMine ? 'self-end' : 'self-start'}`}>
                <View
                  className={`rounded-lg px-4 py-3 ${isMine ? 'bg-accent' : 'bg-white border border-olive-200'}`}
                >
                  <Text className="font-sans text-base text-ink-900">{item.body}</Text>
                </View>
              </View>
            );
          }}
        />

        <View className="flex-row items-center gap-3 px-6 pb-6 pt-2">
          <View className="flex-1">
            <TextField
              placeholder="Escribe un mensaje"
              value={draft}
              onChangeText={setDraft}
              multiline
            />
          </View>
          <IconButton
            tone="solid"
            active
            onPress={() => {
              if (draft.trim().length > 0) {
                sendMutation.mutate();
              }
            }}
          >
            <Send color="#14170F" size={18} />
          </IconButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
