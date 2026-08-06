import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { assignAnnonce, getAnnonce } from '../../src/api/annonces';
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
import { Badge } from '../../src/components/badge';
import { Button } from '../../src/components/button';
import { CategoryBadge } from '../../src/components/category-badge';
import { IconButton } from '../../src/components/icon-button';
import { TextField } from '../../src/components/text-field';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
import { ANNONCE_STATUS_LABELS, ANNONCE_STATUS_TONES } from '../../src/lib/annonce-status';

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

  const annonceId = conversationQuery.data?.annonceId;
  const annonceQuery = useQuery({
    queryKey: ['annonce', annonceId],
    queryFn: () => getAnnonce(annonceId!),
    enabled: !!annonceId,
  });

  const assignMutation = useMutation({
    mutationFn: () => assignAnnonce(annonceId!, otherId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annonce', annonceId] });
      queryClient.invalidateQueries({ queryKey: ['annonces'] });
    },
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

  const annonce = annonceQuery.data;
  // "Poster reviewing an applicant's chat" is the only case where accepting
  // from here makes sense — otherId is the applicant precisely because a
  // conversation is only ever between the poster and one applicant on this
  // annonce (getOrCreateConversation / the auto-create-on-apply trigger).
  const isPoster = !!me && !!annonce && me.id === annonce.posterId;
  const isChosen = !!annonce && !!otherId && annonce.chosenHelperId === otherId;
  const canAssign = !!annonce && (annonce.status === 'open' || annonce.status === 'in_review');
  const showAcceptButton = isPoster && canAssign && !isChosen;

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <View className="border-b border-olive-100 px-6 pb-4 pt-6">
        <View className="flex-row items-center gap-3">
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

        {annonce ? (
          <View className="mt-3 gap-3">
            <Pressable
              onPress={() => router.push(`/annonces/${annonce.id}`)}
              className="flex-row items-center gap-2 rounded-md border border-olive-100 bg-white px-3 py-2 active:bg-olive-50"
            >
              <CategoryBadge category={annonce.category} />
              <Text
                numberOfLines={1}
                className="flex-1 font-sans-semibold text-sm text-ink-900"
              >
                {annonce.title}
              </Text>
              <Badge tone={ANNONCE_STATUS_TONES[annonce.status]}>
                {ANNONCE_STATUS_LABELS[annonce.status]}
              </Badge>
            </Pressable>

            {showAcceptButton ? (
              <Button
                size="sm"
                onPress={() => assignMutation.mutate()}
                disabled={assignMutation.isPending}
              >
                {assignMutation.isPending ? 'Eligiendo…' : `Elegir a ${otherName}`}
              </Button>
            ) : isChosen ? (
              <Badge tone="accent">Elegido para este trabajo</Badge>
            ) : null}

            {assignMutation.isError ? (
              <Text className="font-sans text-sm text-danger">
                No se pudo elegir a este aplicante. Inténtalo de nuevo.
              </Text>
            ) : null}
          </View>
        ) : null}
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
