import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cancelAnnonce, getAnnonce, assignAnnonce, type Annonce } from '../../src/api/annonces';
import {
  applyToAnnonce,
  hasApplied,
  listApplicationsForAnnonce,
  type Application,
} from '../../src/api/applications';
import { getOrCreateConversation } from '../../src/api/conversations';
import { displayNameFor, getProfile, getProfiles, type Profile } from '../../src/api/profiles';
import { Avatar } from '../../src/components/avatar';
import { Badge } from '../../src/components/badge';
import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { LocationPreview } from '../../src/components/location-preview';
import { TextArea } from '../../src/components/text-area';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
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

  const meQuery = useCurrentProfile();

  const cancelMutation = useMutation({
    mutationFn: () => cancelAnnonce(annonce.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annonce', annonce.id] });
      queryClient.invalidateQueries({ queryKey: ['annonces'] });
    },
  });

  const isOwner = meQuery.data?.id === annonce.posterId;
  const canCancel = isOwner && (annonce.status === 'open' || annonce.status === 'in_review');
  const isAcceptingApplicants = annonce.status === 'open' || annonce.status === 'in_review';

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

        {isOwner ? (
          <ApplicantsSection annonce={annonce} />
        ) : meQuery.data && isAcceptingApplicants ? (
          <ApplySection annonce={annonce} applicantId={meQuery.data.id} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ApplySection({ annonce, applicantId }: { annonce: Annonce; applicantId: string }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');

  const hasAppliedQuery = useQuery({
    queryKey: ['application', 'mine', annonce.id, applicantId],
    queryFn: () => hasApplied(annonce.id, applicantId),
  });

  const applyMutation = useMutation({
    mutationFn: () => applyToAnnonce(annonce.id, applicantId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', 'mine', annonce.id] });
      queryClient.invalidateQueries({ queryKey: ['annonce', annonce.id] });
      queryClient.invalidateQueries({ queryKey: ['annonces'] });
      setExpanded(false);
      setMessage('');
    },
  });

  if (hasAppliedQuery.data) {
    return <Badge tone="success">Ya aplicaste</Badge>;
  }

  if (!expanded) {
    return (
      <Button onPress={() => setExpanded(true)} disabled={hasAppliedQuery.isLoading}>
        Aplicar
      </Button>
    );
  }

  return (
    <View className="gap-3">
      <Text className="font-sans-semibold text-sm text-olive-700">
        Cuéntale al anfitrión por qué eres una buena opción
      </Text>
      <TextArea placeholder="Escribe tu mensaje" value={message} onChangeText={setMessage} />
      {applyMutation.isError ? (
        <Text className="font-sans text-sm text-danger">
          No se pudo enviar tu aplicación. Inténtalo de nuevo.
        </Text>
      ) : null}
      <View className="flex-row gap-3">
        <Button
          onPress={() => applyMutation.mutate()}
          disabled={applyMutation.isPending || message.trim().length === 0}
        >
          {applyMutation.isPending ? 'Enviando…' : 'Enviar aplicación'}
        </Button>
        <Button variant="ghost" onPress={() => setExpanded(false)}>
          Cancelar
        </Button>
      </View>
    </View>
  );
}

function ApplicantsSection({ annonce }: { annonce: Annonce }) {
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: ['applications', annonce.id],
    queryFn: () => listApplicationsForAnnonce(annonce.id),
  });

  const applicantIds = applicationsQuery.data?.map((application) => application.applicantId) ?? [];

  const profilesQuery = useQuery({
    queryKey: ['profiles', applicantIds],
    queryFn: () => getProfiles(applicantIds),
    enabled: applicantIds.length > 0,
  });

  const assignMutation = useMutation({
    mutationFn: (helperId: string) => assignAnnonce(annonce.id, helperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annonce', annonce.id] });
      queryClient.invalidateQueries({ queryKey: ['annonces'] });
    },
  });

  const messageMutation = useMutation({
    mutationFn: (applicantId: string) =>
      getOrCreateConversation(annonce.id, annonce.posterId, applicantId),
    onSuccess: (conversation) => {
      router.push(`/messages/${conversation.id}`);
    },
  });

  if (applicationsQuery.isLoading) {
    return null;
  }

  const applications = applicationsQuery.data ?? [];

  if (applications.length === 0) {
    return <Text className="font-sans text-base text-olive-600">Todavía nadie ha aplicado.</Text>;
  }

  const profileById = new Map((profilesQuery.data ?? []).map((profile) => [profile.id, profile]));
  const canAssign = annonce.status === 'open' || annonce.status === 'in_review';

  return (
    <View className="gap-3">
      <Text className="font-sans-bold text-lg text-ink-900">
        Aplicantes ({applications.length})
      </Text>
      {applications.map((application) => {
        const profile = profileById.get(application.applicantId);
        const isChosen = annonce.chosenHelperId === application.applicantId;
        return (
          <ApplicantCard
            key={application.id}
            application={application}
            profile={profile}
            isChosen={isChosen}
            canAssign={canAssign}
            onAssign={() => assignMutation.mutate(application.applicantId)}
            assigning={
              assignMutation.isPending && assignMutation.variables === application.applicantId
            }
            onMessage={() => messageMutation.mutate(application.applicantId)}
            messaging={
              messageMutation.isPending && messageMutation.variables === application.applicantId
            }
          />
        );
      })}
    </View>
  );
}

function ApplicantCard({
  application,
  profile,
  isChosen,
  canAssign,
  onAssign,
  assigning,
  onMessage,
  messaging,
}: {
  application: Application;
  profile: Profile | undefined;
  isChosen: boolean;
  canAssign: boolean;
  onAssign: () => void;
  assigning: boolean;
  onMessage: () => void;
  messaging: boolean;
}) {
  return (
    <Card className="gap-3">
      <Pressable
        onPress={() => profile && router.push(`/profile/${profile.id}`)}
        className="flex-row items-center gap-3"
      >
        <Avatar
          src={profile?.avatarUrl}
          initials={profile ? displayNameFor(profile).charAt(0).toUpperCase() || '?' : '?'}
          size={44}
        />
        <View className="flex-1">
          <Text className="font-sans-semibold text-base text-ink-900">
            {profile ? displayNameFor(profile) : 'Cargando…'}
          </Text>
          {profile?.averageRating != null ? (
            <Text className="font-sans text-xs text-olive-600">
              Calificación: {profile.averageRating.toFixed(1)}
            </Text>
          ) : null}
        </View>
        {isChosen ? <Badge tone="accent">Elegido</Badge> : null}
      </Pressable>

      <Text className="font-sans text-sm text-olive-700">{application.message}</Text>

      <View className="flex-row gap-3">
        {canAssign && !isChosen ? (
          <Button variant="outline" onPress={onAssign} disabled={assigning}>
            {assigning ? 'Eligiendo…' : 'Elegir'}
          </Button>
        ) : null}
        <Button variant="ghost" onPress={onMessage} disabled={messaging}>
          {messaging ? 'Abriendo…' : 'Enviar mensaje'}
        </Button>
      </View>
    </Card>
  );
}
