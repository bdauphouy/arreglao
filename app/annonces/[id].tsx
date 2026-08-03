import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cancelAnnonce, getAnnonce, type Annonce } from '../../src/api/annonces';
import { getCurrentUserId } from '../../src/api/auth';
import { displayNameFor, getProfile } from '../../src/api/profiles';
import { Avatar } from '../../src/components/avatar';
import { Badge } from '../../src/components/badge';
import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { LocationPreview } from '../../src/components/location-preview';
import { ANNONCE_STATUS_LABELS, ANNONCE_STATUS_TONES } from '../../src/lib/annonce-status';
import { JOB_CATEGORY_LABELS } from '../../src/lib/job-categories';

export default function AnnonceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const annonceQuery = useQuery({
    queryKey: ['annonce', id],
    queryFn: () => getAnnonce(id),
    enabled: !!id,
  });

  if (!annonceQuery.data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand">
        <Text className="font-sans text-base text-olive-600">
          {annonceQuery.isError ? 'No se pudo cargar este anuncio.' : 'Cargando…'}
        </Text>
      </SafeAreaView>
    );
  }

  return <AnnonceDetail annonce={annonceQuery.data} />;
}

function AnnonceDetail({ annonce }: { annonce: Annonce }) {
  const queryClient = useQueryClient();

  const posterQuery = useQuery({
    queryKey: ['profile', annonce.posterId],
    queryFn: () => getProfile(annonce.posterId),
  });

  const meQuery = useQuery({
    queryKey: ['auth', 'currentUserId'],
    queryFn: getCurrentUserId,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelAnnonce(annonce.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annonce', annonce.id] });
      queryClient.invalidateQueries({ queryKey: ['annonces'] });
    },
  });

  const isOwner = meQuery.data === annonce.posterId;
  const canCancel = isOwner && (annonce.status === 'open' || annonce.status === 'in_review');

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <ScrollView contentContainerClassName="gap-6 px-6 pb-10 pt-6">
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <Badge tone="neutral">{JOB_CATEGORY_LABELS[annonce.category]}</Badge>
            <Badge tone={ANNONCE_STATUS_TONES[annonce.status]}>
              {ANNONCE_STATUS_LABELS[annonce.status]}
            </Badge>
          </View>
          <Text className="font-sans-extrabold text-2xl text-ink-900">{annonce.title}</Text>
          <Text className="font-sans text-base text-olive-700">{annonce.description}</Text>
        </View>

        <LocationPreview location={annonce.location} />

        {posterQuery.data ? (
          <Pressable onPress={() => router.push(`/profile/${posterQuery.data.id}`)}>
            <Card className="flex-row items-center gap-3">
              <Avatar
                src={posterQuery.data.avatarUrl}
                initials={displayNameFor(posterQuery.data).charAt(0).toUpperCase() || '?'}
                size={48}
              />
              <View>
                <Text className="font-sans-semibold text-base text-ink-900">
                  {displayNameFor(posterQuery.data)}
                </Text>
                <Text className="font-sans text-xs text-olive-600">Ver perfil</Text>
              </View>
            </Card>
          </Pressable>
        ) : null}

        {canCancel ? (
          <Button
            variant="outline"
            onPress={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? 'Cancelando…' : 'Cancelar anuncio'}
          </Button>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
