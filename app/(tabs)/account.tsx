import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Bookmark,
  ChevronRight,
  Eye,
  LogOut,
  Megaphone,
  Send,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAnnonces, listAnnoncesForPoster, type Annonce } from '../../src/api/annonces';
import {
  listApplicationsForApplicant,
  withdrawApplication,
  type Application,
} from '../../src/api/applications';
import { signOut } from '../../src/api/auth';
import {
  displayNameFor,
  updateProfileDetails,
  uploadAvatar,
  type Profile,
} from '../../src/api/profiles';
import { listSavedAnnonceIds, unsaveAnnonce } from '../../src/api/saved-annonces';
import type { Address } from '../../src/components/address-autocomplete';
import { AddressAutocomplete } from '../../src/components/address-autocomplete';
import { Avatar } from '../../src/components/avatar';
import { AvatarPicker } from '../../src/components/avatar-picker';
import { Badge } from '../../src/components/badge';
import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { CategoryBadge } from '../../src/components/category-badge';
import { CategoryTagPicker } from '../../src/components/category-tag-picker';
import { Pill } from '../../src/components/pill';
import { Switch } from '../../src/components/switch';
import { TextArea } from '../../src/components/text-area';
import { TextField } from '../../src/components/text-field';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
import {
  ANNONCE_STATUS_LABELS,
  ANNONCE_STATUS_TONES,
  isTerminalAnnonceStatus,
} from '../../src/lib/annonce-status';
import {
  APPLICATION_STATUS_LABELS,
  isWithdrawn,
  type ApplicationStatus,
} from '../../src/lib/application-status';
import { formatMemberSince, relativeTimeFromNow } from '../../src/lib/relative-time';
import { profileEditSchema, type ProfileEditInput } from '../../src/schemas/profile';
import { useAppStore } from '../../src/stores/app-store';

type ViewKey = 'menu' | 'edit' | 'posts' | 'applied' | 'saved';

const VIEW_TITLES: Record<ViewKey, string> = {
  menu: 'Mi perfil',
  edit: 'Editar perfil',
  posts: 'Mis publicaciones',
  applied: 'Postulaciones',
  saved: 'Guardados',
};

export default function MyProfileScreen() {
  const profileQuery = useCurrentProfile();
  const queryClient = useQueryClient();
  const [view, setView] = useState<ViewKey>('menu');

  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const logoutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(['profile', 'me'], null);
      resetOnboarding();
      router.replace('/(onboarding)/welcome');
    },
  });

  if (!profileQuery.data) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-sand"
        edges={['top', 'left', 'right']}
      >
        <Text className="font-sans text-base text-olive-600">
          {profileQuery.isError ? 'No se pudo cargar tu perfil.' : 'Cargando…'}
        </Text>
      </SafeAreaView>
    );
  }

  const profile = profileQuery.data;

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center gap-3 px-6 pb-2 pt-2">
        <Pressable
          onPress={() => (view === 'menu' ? router.back() : setView('menu'))}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center"
        >
          <ArrowLeft size={22} strokeWidth={1.75} color="#14170F" />
        </Pressable>
        <Text className="font-sans-extrabold text-xl text-ink-900">{VIEW_TITLES[view]}</Text>
      </View>

      {view === 'menu' ? (
        <ProfileMenu
          profile={profile}
          onNavigate={setView}
          onLogout={() => logoutMutation.mutate()}
          loggingOut={logoutMutation.isPending}
          logoutError={logoutMutation.isError}
        />
      ) : null}
      {view === 'edit' ? (
        <ProfileEditForm key={profile.id} profile={profile} onSaved={() => setView('menu')} />
      ) : null}
      {view === 'posts' ? <MyAnnoncesList posterId={profile.id} /> : null}
      {view === 'applied' ? <AppliedList applicantId={profile.id} /> : null}
      {view === 'saved' ? <SavedList userId={profile.id} /> : null}
    </SafeAreaView>
  );
}

function ProfileMenu({
  profile,
  onNavigate,
  onLogout,
  loggingOut,
  logoutError,
}: {
  profile: Profile;
  onNavigate: (view: ViewKey) => void;
  onLogout: () => void;
  loggingOut: boolean;
  logoutError: boolean;
}) {
  return (
    <ScrollView contentContainerClassName="gap-6 px-6 pb-10 pt-2">
      <View className="flex-row items-center gap-3">
        <Avatar
          src={profile.avatarUrl}
          initials={displayNameFor(profile).charAt(0).toUpperCase() || '?'}
          size={56}
        />
        <View className="flex-1">
          <Text className="font-sans-semibold text-lg text-ink-900">
            {displayNameFor(profile) || 'Sin nombre'}
          </Text>
          <Text className="font-sans text-sm text-olive-600">
            {formatMemberSince(profile.createdAt)}
          </Text>
          {profile.averageRating != null ? (
            <Text className="font-sans text-sm text-olive-600">
              Calificación: {profile.averageRating.toFixed(1)}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="rounded-md border border-olive-100 bg-white">
        <MenuRow icon={UserRound} label="Editar perfil" onPress={() => onNavigate('edit')} />
        <MenuDivider />
        <MenuRow icon={Megaphone} label="Mis publicaciones" onPress={() => onNavigate('posts')} />
        <MenuDivider />
        <MenuRow icon={Send} label="Postulaciones" onPress={() => onNavigate('applied')} />
        <MenuDivider />
        <MenuRow icon={Bookmark} label="Guardados" onPress={() => onNavigate('saved')} />
        <MenuDivider />
        <MenuRow
          icon={Eye}
          label="Ver mi perfil público"
          onPress={() => router.push(`/profile/${profile.id}`)}
        />
      </View>

      <View className="gap-2">
        <View className="rounded-md border border-olive-100 bg-white">
          <MenuRow
            icon={LogOut}
            label={loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
            tone="danger"
            onPress={onLogout}
            disabled={loggingOut}
            showChevron={false}
          />
        </View>
        {logoutError ? (
          <Text className="px-1 font-sans text-sm text-danger">
            No se pudo cerrar sesión. Inténtalo de nuevo.
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onPress,
  disabled,
  showChevron = true,
  tone = 'default',
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  showChevron?: boolean;
  tone?: 'default' | 'danger';
}) {
  const iconColor = tone === 'danger' ? '#C1473B' : '#14170F';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`flex-row items-center gap-3 px-4 py-4 active:bg-olive-50 ${disabled ? 'opacity-50' : ''}`}
    >
      <Icon size={18} color={iconColor} />
      <Text
        className={`flex-1 font-sans-medium text-base ${tone === 'danger' ? 'text-danger' : 'text-ink-900'}`}
      >
        {label}
      </Text>
      {showChevron ? <ChevronRight size={18} color="#9C9877" /> : null}
    </Pressable>
  );
}

function MenuDivider() {
  return <View className="h-px bg-olive-100" />;
}

function EmptyState({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-10">
      <Text className="text-center font-sans text-base text-olive-600">{label}</Text>
    </View>
  );
}

// Display order for the Postulaciones groups — still-open first, then how
// each one was resolved. Withdrawn applications aren't listed here: once
// withdrawn, an application isn't a dead/canceled outcome to show a history
// of — it just means the user isn't currently applied (#41).
const APPLICATION_STATUS_ORDER: ApplicationStatus[] = ['pending', 'accepted', 'rejected'];

function AppliedList({ applicantId }: { applicantId: string }) {
  const queryClient = useQueryClient();

  const applicationsQuery = useQuery({
    queryKey: ['applications', 'mine', applicantId],
    queryFn: () => listApplicationsForApplicant(applicantId),
  });

  // Withdrawn applications aren't shown here at all (see
  // APPLICATION_STATUS_ORDER above) — filter them out up front so a user
  // whose only applications are withdrawn ones sees the empty state below
  // instead of a blank scroll view.
  const applications = (applicationsQuery.data ?? []).filter(
    (application) => !isWithdrawn(application.status),
  );
  const annonceIds = applications.map((application) => application.annonceId);

  const annoncesQuery = useQuery({
    queryKey: ['annonces', annonceIds],
    queryFn: () => getAnnonces(annonceIds),
    enabled: annonceIds.length > 0,
  });
  const annonceById = new Map((annoncesQuery.data ?? []).map((annonce) => [annonce.id, annonce]));

  const withdrawMutation = useMutation({
    mutationFn: ({ applicationId }: { applicationId: string; annonceId: string }) =>
      withdrawApplication(applicationId),
    onSuccess: (_data, { annonceId }) => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'mine', applicantId] });
      // ApplyForm's "Ya aplicaste" gate (hasApplied) and other-applicants'
      // price list both key off these — without invalidating them, tapping
      // back into the annonce right after withdrawing could still show a
      // stale "already applied" state.
      queryClient.invalidateQueries({ queryKey: ['applications', annonceId] });
      queryClient.invalidateQueries({ queryKey: ['application', 'mine', annonceId] });
      queryClient.invalidateQueries({ queryKey: ['annonces'] });
    },
  });

  if (applicationsQuery.isLoading) {
    return <EmptyState label="Cargando…" />;
  }

  if (applications.length === 0) {
    return <EmptyState label="Todavía no has aplicado a ningún trabajo." />;
  }

  return (
    <ScrollView contentContainerClassName="gap-6 px-6 pb-10 pt-2">
      {APPLICATION_STATUS_ORDER.map((status) => {
        const group = applications.filter((application) => application.status === status);
        if (group.length === 0) {
          return null;
        }
        // Withdrawing only makes sense while the outcome isn't final yet —
        // rejected/withdrawn applications have nothing left to cancel.
        const canWithdraw = status === 'pending' || status === 'accepted';
        return (
          <View key={status} className="gap-3">
            <Text className="font-sans-bold text-base text-ink-900">
              {APPLICATION_STATUS_LABELS[status]} ({group.length})
            </Text>
            <View className="gap-3">
              {group.map((application) => {
                const annonce = annonceById.get(application.annonceId);
                if (!annonce) {
                  return null;
                }
                return (
                  <AppliedCard
                    key={application.id}
                    application={application}
                    annonce={annonce}
                    onWithdraw={
                      canWithdraw
                        ? () =>
                            withdrawMutation.mutate({
                              applicationId: application.id,
                              annonceId: application.annonceId,
                            })
                        : undefined
                    }
                    withdrawing={
                      withdrawMutation.isPending &&
                      withdrawMutation.variables?.applicationId === application.id
                    }
                  />
                );
              })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// Shared by AppliedCard/MyAnnonceCard/SavedCard: every "list of annonces"
// card in this screen is the same category+status header and title over a
// tap target to the annonce detail screen, differing only in which extra
// line of metadata it shows underneath.
function AnnonceSummaryCard({ annonce, meta }: { annonce: Annonce; meta?: ReactNode }) {
  return (
    <Pressable onPress={() => router.push(`/annonces/${annonce.id}`)}>
      <Card className="gap-2">
        <View className="flex-row items-center gap-2">
          <CategoryBadge category={annonce.category} />
          <Badge tone={ANNONCE_STATUS_TONES[annonce.status]}>
            {ANNONCE_STATUS_LABELS[annonce.status]}
          </Badge>
        </View>
        <Text className="font-sans-semibold text-base text-ink-900">{annonce.title}</Text>
        {meta}
      </Card>
    </Pressable>
  );
}

function AppliedCard({
  application,
  annonce,
  onWithdraw,
  withdrawing,
}: {
  application: Application;
  annonce: Annonce;
  onWithdraw?: () => void;
  withdrawing?: boolean;
}) {
  return (
    <View className="gap-2">
      <AnnonceSummaryCard
        annonce={annonce}
        meta={
          <View className="flex-row items-center gap-3">
            <Text className="font-sans-semibold text-sm text-ink-900">
              L {application.proposedPrice}
            </Text>
            <Text className="font-sans text-xs text-olive-600">
              {relativeTimeFromNow(application.createdAt)}
            </Text>
          </View>
        }
      />
      {onWithdraw ? (
        <Pressable
          onPress={onWithdraw}
          disabled={withdrawing}
          className="flex-row items-center justify-center rounded-md border border-olive-100 bg-white py-2"
        >
          <Text className="font-sans-medium text-sm text-danger">
            {withdrawing ? 'Cancelando…' : 'Cancelar aplicación'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type AnnoncesFilter = 'active' | 'past';

function MyAnnoncesList({ posterId }: { posterId: string }) {
  const [filter, setFilter] = useState<AnnoncesFilter>('active');

  const annoncesQuery = useQuery({
    queryKey: ['annonces', 'mine', posterId],
    queryFn: () => listAnnoncesForPoster(posterId),
  });

  const allAnnonces = annoncesQuery.data ?? [];
  const annonces = allAnnonces.filter((annonce) =>
    filter === 'past'
      ? isTerminalAnnonceStatus(annonce.status)
      : !isTerminalAnnonceStatus(annonce.status),
  );

  if (annoncesQuery.isLoading) {
    return <EmptyState label="Cargando…" />;
  }

  if (allAnnonces.length === 0) {
    return <EmptyState label="Todavía no has publicado ningún anuncio." />;
  }

  return (
    <FlatList
      data={annonces}
      keyExtractor={(item) => item.id}
      contentContainerClassName="gap-3 px-6 pb-10 pt-2"
      ListHeaderComponent={
        <View className="flex-row gap-2">
          <Pill selected={filter === 'active'} onPress={() => setFilter('active')}>
            Activos
          </Pill>
          <Pill selected={filter === 'past'} onPress={() => setFilter('past')}>
            Anteriores
          </Pill>
        </View>
      }
      ListEmptyComponent={
        <Text className="px-1 font-sans text-base text-olive-600">
          {filter === 'past'
            ? 'No tienes publicaciones anteriores.'
            : 'No tienes publicaciones activas.'}
        </Text>
      }
      renderItem={({ item }) => <MyAnnonceCard annonce={item} />}
    />
  );
}

function MyAnnonceCard({ annonce }: { annonce: Annonce }) {
  return (
    <AnnonceSummaryCard
      annonce={annonce}
      meta={
        <View className="flex-row items-center gap-3">
          <Text className="font-sans text-sm text-olive-600">
            {annonce.applicationsCount}{' '}
            {annonce.applicationsCount === 1 ? 'aplicante' : 'aplicantes'}
          </Text>
          <Text className="font-sans text-xs text-olive-600">
            {relativeTimeFromNow(annonce.createdAt)}
          </Text>
        </View>
      }
    />
  );
}

function SavedList({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const savedIdsQuery = useQuery({
    queryKey: ['saved-annonces', userId],
    queryFn: () => listSavedAnnonceIds(userId),
  });
  const savedIds = savedIdsQuery.data ?? [];

  const annoncesQuery = useQuery({
    queryKey: ['annonces', savedIds],
    queryFn: () => getAnnonces(savedIds),
    enabled: savedIds.length > 0,
  });

  const unsaveMutation = useMutation({
    mutationFn: (annonceId: string) => unsaveAnnonce(userId, annonceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-annonces', userId] });
    },
  });

  if (savedIdsQuery.isLoading) {
    return <EmptyState label="Cargando…" />;
  }

  if (savedIds.length === 0) {
    return <EmptyState label="No tienes anuncios guardados." />;
  }

  return (
    <FlatList
      data={annoncesQuery.data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerClassName="gap-3 px-6 pb-10 pt-2"
      renderItem={({ item }) => (
        <SavedCard
          annonce={item}
          onUnsave={() => unsaveMutation.mutate(item.id)}
          unsaving={unsaveMutation.isPending && unsaveMutation.variables === item.id}
        />
      )}
    />
  );
}

function SavedCard({
  annonce,
  onUnsave,
  unsaving,
}: {
  annonce: Annonce;
  onUnsave: () => void;
  unsaving: boolean;
}) {
  return (
    <View>
      <AnnonceSummaryCard
        annonce={annonce}
        meta={
          annonce.budget != null ? (
            <Text className="font-sans text-sm text-olive-700">L {annonce.budget}</Text>
          ) : undefined
        }
      />
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onUnsave();
        }}
        disabled={unsaving}
        className="mt-1 flex-row items-center justify-center gap-2 rounded-md border border-olive-100 bg-white py-2"
      >
        <Bookmark size={16} color="#14170F" fill="#14170F" />
        <Text className="font-sans-medium text-sm text-ink-900">
          {unsaving ? 'Quitando…' : 'Quitar de guardados'}
        </Text>
      </Pressable>
    </View>
  );
}

function ProfileEditForm({ profile, onSaved }: { profile: Profile; onSaved: () => void }) {
  const queryClient = useQueryClient();
  const [address, setAddress] = useState<Address | null>(
    profile.location && profile.addressLabel
      ? { lat: profile.location.lat, lng: profile.location.lng, label: profile.addressLabel }
      : null,
  );

  const { control, handleSubmit } = useForm<ProfileEditInput>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: profile.firstName ?? '',
      lastName: profile.lastName ?? '',
      bio: profile.bio ?? '',
      categoryTags: profile.categoryTags,
      isAvailable: profile.isAvailable,
    },
  });

  const saveProfile = useMutation({
    mutationFn: (data: ProfileEditInput) =>
      updateProfileDetails(profile.id, {
        ...data,
        location: address ? { lat: address.lat, lng: address.lng } : null,
        addressLabel: address?.label ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      onSaved();
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (base64: string) => uploadAvatar(profile.id, base64),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });

  return (
    <ScrollView contentContainerClassName="gap-6 px-6 pb-10 pt-2">
      <View className="items-start gap-3">
        <AvatarPicker
          avatarUrl={profile.avatarUrl}
          uploading={uploadAvatarMutation.isPending}
          onPick={(base64) => uploadAvatarMutation.mutate(base64)}
        />
        {profile.averageRating != null ? (
          <Text className="font-sans text-sm text-olive-600">
            Calificación: {profile.averageRating.toFixed(1)}
          </Text>
        ) : null}
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 gap-3">
          <Text className="font-sans-semibold text-sm text-olive-700">Nombre</Text>
          <Controller
            control={control}
            name="firstName"
            render={({ field, fieldState }) => (
              <>
                <TextField value={field.value} onChangeText={field.onChange} placeholder="Nombre" />
                {fieldState.error ? (
                  <Text className="font-sans text-sm text-danger">{fieldState.error.message}</Text>
                ) : null}
              </>
            )}
          />
        </View>
        <View className="flex-1 gap-3">
          <Text className="font-sans-semibold text-sm text-olive-700">Apellido</Text>
          <Controller
            control={control}
            name="lastName"
            render={({ field, fieldState }) => (
              <>
                <TextField
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Apellido"
                />
                {fieldState.error ? (
                  <Text className="font-sans text-sm text-danger">{fieldState.error.message}</Text>
                ) : null}
              </>
            )}
          />
        </View>
      </View>

      <View className="gap-3">
        <Text className="font-sans-semibold text-sm text-olive-700">Sobre ti</Text>
        <Controller
          control={control}
          name="bio"
          render={({ field }) => (
            <TextArea
              placeholder="Cuéntales a los demás en qué puedes ayudar"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
      </View>

      <View className="flex-row items-center justify-between gap-3 rounded-md border border-olive-100 bg-white px-4 py-4">
        <View className="flex-1 gap-1">
          <Text className="font-sans-semibold text-sm text-ink-900">Disponible para trabajar</Text>
          <Text className="font-sans text-xs text-olive-600">
            Solo los ayudantes disponibles aparecen en la pantalla de Ayudantes.
          </Text>
        </View>
        <Controller
          control={control}
          name="isAvailable"
          render={({ field }) => <Switch value={field.value} onValueChange={field.onChange} />}
        />
      </View>

      <View className="gap-3">
        <Text className="font-sans-semibold text-sm text-olive-700">Categorías que sigues</Text>
        <Text className="font-sans text-sm text-olive-600">
          Recibe ofertas solo de estos sectores. Puedes no elegir ninguna.
        </Text>
        <Controller
          control={control}
          name="categoryTags"
          render={({ field }) => (
            <CategoryTagPicker value={field.value} onChange={field.onChange} />
          )}
        />
      </View>

      <View className="gap-3">
        <Text className="font-sans-semibold text-sm text-olive-700">Dirección</Text>
        <AddressAutocomplete value={address} onChange={setAddress} />
      </View>

      {saveProfile.isError ? (
        <Text className="font-sans text-sm text-danger">
          No se pudo guardar tu perfil. Inténtalo de nuevo.
        </Text>
      ) : null}

      <Button
        size="lg"
        onPress={handleSubmit((data) => saveProfile.mutate(data))}
        disabled={saveProfile.isPending}
      >
        {saveProfile.isPending ? 'Guardando…' : 'Guardar'}
      </Button>
    </ScrollView>
  );
}
