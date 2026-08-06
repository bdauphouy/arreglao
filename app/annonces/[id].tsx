import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  cancelAnnonce,
  getAnnonce,
  assignAnnonce,
  unassignAnnonce,
  type Annonce,
} from '../../src/api/annonces';
import { listApplicationsForAnnonce, type Application } from '../../src/api/applications';
import { getOrCreateConversation } from '../../src/api/conversations';
import { displayNameFor, getProfile, getProfiles, type Profile } from '../../src/api/profiles';
import { ApplyForm } from '../../src/components/apply-form';
import { Avatar } from '../../src/components/avatar';
import { Badge } from '../../src/components/badge';
import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { CategoryBadge } from '../../src/components/category-badge';
import { LocationPreview } from '../../src/components/location-preview';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
import { ANNONCE_STATUS_LABELS, ANNONCE_STATUS_TONES } from '../../src/lib/annonce-status';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  isWithdrawn,
} from '../../src/lib/application-status';

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
  const isViewerProfile = (profileId: string) => profileId === meQuery.data?.id;

  return (
    <SafeAreaView className="flex-1 bg-sand">
      <ScrollView contentContainerClassName="gap-6 px-6 pb-10 pt-6">
        <View className="gap-2">
          <Badge tone={ANNONCE_STATUS_TONES[annonce.status]}>
            {ANNONCE_STATUS_LABELS[annonce.status]}
          </Badge>
          <View className="flex-row items-start justify-between gap-3">
            <Text className="flex-1 font-sans-extrabold text-2xl text-ink-900">
              {annonce.title}
            </Text>
            <CategoryBadge category={annonce.category} />
          </View>
          <Text className="font-sans text-base text-olive-700">{annonce.description}</Text>
          {annonce.budget != null ? (
            <Text className="font-sans-semibold text-base text-ink-900">
              Presupuesto: L {annonce.budget}
            </Text>
          ) : null}
        </View>

        <LocationPreview location={annonce.location} />

        {posterQuery.data && !isViewerProfile(posterQuery.data.id) ? (
          <PosterCard poster={posterQuery.data} />
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
          <ApplicantsSection annonce={annonce} isViewerProfile={isViewerProfile} />
        ) : meQuery.data && isAcceptingApplicants ? (
          <ApplyForm annonce={annonce} applicantId={meQuery.data.id} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileLink({
  disabled,
  onPress,
  children,
}: {
  disabled: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {children}
    </Pressable>
  );
}

function PosterCard({ poster }: { poster: Profile }) {
  return (
    <Pressable onPress={() => router.push(`/profile/${poster.id}`)}>
      <Card className="flex-row items-center gap-3">
        <Avatar
          src={poster.avatarUrl}
          initials={displayNameFor(poster).charAt(0).toUpperCase() || '?'}
          size={48}
        />
        <View>
          <Text className="font-sans-semibold text-base text-ink-900">
            {displayNameFor(poster)}
          </Text>
          <Text className="font-sans text-xs text-olive-600">Ver perfil</Text>
        </View>
      </Card>
    </Pressable>
  );
}

function ApplicantsSection({
  annonce,
  isViewerProfile,
}: {
  annonce: Annonce;
  isViewerProfile: (profileId: string) => boolean;
}) {
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
      queryClient.invalidateQueries({ queryKey: ['applications', annonce.id] });
    },
  });

  const unassignMutation = useMutation({
    mutationFn: () => unassignAnnonce(annonce.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annonce', annonce.id] });
      queryClient.invalidateQueries({ queryKey: ['annonces'] });
      queryClient.invalidateQueries({ queryKey: ['applications', annonce.id] });
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

  // Withdrawn applications aren't real candidates anymore — same
  // "N aplicantes" semantics as annonce.applicationsCount, which already
  // excludes them (see refresh_annonce_applications_count).
  const applications = (applicationsQuery.data ?? []).filter(
    (application) => !isWithdrawn(application.status),
  );

  if (applications.length === 0) {
    return <Text className="font-sans text-base text-olive-600">Todavía nadie ha aplicado.</Text>;
  }

  const profileById = new Map((profilesQuery.data ?? []).map((profile) => [profile.id, profile]));
  const canAssign = annonce.status === 'open' || annonce.status === 'in_review';

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="font-sans-bold text-lg text-ink-900">
          Aplicantes ({applications.length})
        </Text>
        {annonce.status === 'assigned' ? (
          <Button
            variant="outline"
            size="sm"
            onPress={() => unassignMutation.mutate()}
            disabled={unassignMutation.isPending}
          >
            {unassignMutation.isPending ? 'Cambiando…' : 'Cambiar decisión'}
          </Button>
        ) : null}
      </View>
      {applications.map((application) => (
        <ApplicantCard
          key={application.id}
          application={application}
          profile={profileById.get(application.applicantId)}
          disabled={isViewerProfile(application.applicantId)}
          canAssign={canAssign && application.status === 'pending'}
          onAssign={() => assignMutation.mutate(application.applicantId)}
          assigning={
            assignMutation.isPending && assignMutation.variables === application.applicantId
          }
          onMessage={() => messageMutation.mutate(application.applicantId)}
          messaging={
            messageMutation.isPending && messageMutation.variables === application.applicantId
          }
        />
      ))}
    </View>
  );
}

function ApplicantCard({
  application,
  profile,
  disabled,
  canAssign,
  onAssign,
  assigning,
  onMessage,
  messaging,
}: {
  application: Application;
  profile: Profile | undefined;
  disabled: boolean;
  canAssign: boolean;
  onAssign: () => void;
  assigning: boolean;
  onMessage: () => void;
  messaging: boolean;
}) {
  const header = (
    <View className="flex-row items-center gap-3">
      <Avatar
        src={profile?.avatarUrl}
        initials={profile ? displayNameFor(profile).charAt(0).toUpperCase() || '?' : '?'}
        size={44}
      />
      <View className="flex-1">
        <Text className="font-sans-semibold text-base text-ink-900">
          {profile ? displayNameFor(profile) : 'Cargando…'}
        </Text>
        {profile ? (
          <Text className="font-sans text-xs text-olive-600">
            {profile.averageRating != null
              ? `Calificación: ${profile.averageRating.toFixed(1)}`
              : 'Sin reseñas aún'}
          </Text>
        ) : null}
      </View>
      <View className="items-end gap-1">
        {application.status === 'accepted' ? (
          <Badge tone={APPLICATION_STATUS_TONES.accepted}>
            Aprobado por L {application.proposedPrice}
          </Badge>
        ) : (
          <>
            {application.status !== 'pending' ? (
              <Badge tone={APPLICATION_STATUS_TONES[application.status]}>
                {APPLICATION_STATUS_LABELS[application.status]}
              </Badge>
            ) : null}
            <Badge tone="accent">L {application.proposedPrice}</Badge>
          </>
        )}
      </View>
    </View>
  );

  return (
    <Card className="gap-3">
      <ProfileLink
        disabled={disabled}
        onPress={() => profile && router.push(`/profile/${profile.id}`)}
      >
        {header}
      </ProfileLink>

      {application.message ? (
        <Text className="font-sans text-sm text-olive-700">{application.message}</Text>
      ) : null}

      <View className="flex-row justify-end gap-3">
        <Button variant="outline" onPress={onMessage} disabled={messaging}>
          {messaging ? 'Abriendo…' : 'Abrir el chat'}
        </Button>
        {canAssign ? (
          <Button variant="primary" onPress={onAssign} disabled={assigning}>
            {assigning ? 'Eligiendo…' : 'Elegir'}
          </Button>
        ) : null}
      </View>
    </Card>
  );
}
