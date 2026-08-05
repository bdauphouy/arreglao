import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Bookmark, Send, Share2 } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Annonce } from '../../src/api/annonces';
import { listOpenAnnonces } from '../../src/api/annonces';
import { displayNameFor, getProfiles, type Profile } from '../../src/api/profiles';
import { listSavedAnnonceIds, saveAnnonce, unsaveAnnonce } from '../../src/api/saved-annonces';
import { ApplyForm } from '../../src/components/apply-form';
import { Avatar } from '../../src/components/avatar';
import { Card } from '../../src/components/card';
import { CategoryBadge } from '../../src/components/category-badge';
import { CategoryRail } from '../../src/components/category-rail';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
import { distanceKm, type Coordinates } from '../../src/lib/distance';
import { relativeTimeFromNow } from '../../src/lib/relative-time';
import type { JobCategory } from '../../src/schemas/job-category';

export default function HomeScreen() {
  const meQuery = useCurrentProfile();
  const annoncesQuery = useQuery({
    queryKey: ['annonces', 'open'],
    queryFn: () => listOpenAnnonces(),
  });

  const me = meQuery.data ?? null;
  const annonces = useMemo(() => annoncesQuery.data ?? [], [annoncesQuery.data]);
  const myLocation = me?.location ?? null;

  const posterIds = useMemo(
    () => Array.from(new Set(annonces.map((annonce) => annonce.posterId))),
    [annonces],
  );
  const postersQuery = useQuery({
    queryKey: ['profiles', posterIds],
    queryFn: () => getProfiles(posterIds),
    enabled: posterIds.length > 0,
  });
  const posterById = useMemo(
    () => new Map((postersQuery.data ?? []).map((profile) => [profile.id, profile])),
    [postersQuery.data],
  );

  const savedIdsQuery = useQuery({
    queryKey: ['saved-annonces', me?.id],
    queryFn: () => listSavedAnnonceIds(me!.id),
    enabled: !!me,
  });
  const savedIds = useMemo(() => new Set(savedIdsQuery.data ?? []), [savedIdsQuery.data]);

  // Para ti / Cerca de ti / Recientes are meant to be read top to bottom —
  // without excluding what's already shown, the same open annonce shows up
  // in all three (they're independent filters over the same full list, not
  // a partition), which reads as duplicate cards while scrolling.
  const forYou = useMemo(() => {
    if (!me || me.categoryTags.length === 0) {
      return [];
    }
    const tags = new Set(me.categoryTags);
    return annonces.filter((annonce) => tags.has(annonce.category));
  }, [annonces, me]);

  const nearYou = useMemo(() => {
    if (!myLocation) {
      return [];
    }
    const shown = new Set(forYou.map((annonce) => annonce.id));
    return [...annonces]
      .filter((annonce) => !shown.has(annonce.id))
      .sort((a, b) => distanceKm(myLocation, a.location) - distanceKm(myLocation, b.location));
  }, [annonces, myLocation, forYou]);

  const recent = useMemo(() => {
    const shown = new Set([...forYou, ...nearYou].map((annonce) => annonce.id));
    return annonces.filter((annonce) => !shown.has(annonce.id));
  }, [annonces, forYou, nearYou]);

  const greetingName = me?.firstName ?? null;

  const handleSelectCategory = (category: JobCategory) => {
    router.push(`/annonces/category/${category}`);
  };

  const [applyingAnnonce, setApplyingAnnonce] = useState<Annonce | null>(null);
  const applySheetRef = useRef<BottomSheetModal>(null);

  const handleApply = (annonce: Annonce) => {
    setApplyingAnnonce(annonce);
    applySheetRef.current?.present();
  };

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top', 'left', 'right']}>
      <ScrollView contentContainerClassName="gap-6 pb-10 pt-6">
        <View className="gap-4 px-6">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.push('/account')}>
              <Avatar
                src={me?.avatarUrl}
                initials={me ? displayNameFor(me).charAt(0).toUpperCase() || '?' : '?'}
                size={44}
              />
            </Pressable>
            <Text className="font-sans-extrabold text-2xl text-ink-900">
              {greetingName ? `Hola, ${greetingName}` : 'Hola'}
            </Text>
          </View>

          <Pressable onPress={() => router.push('/annonces/new')}>
            <View className="h-14 flex-row items-center rounded-full border border-olive-200 bg-white px-6">
              <Text className="font-sans text-base text-olive-600">¿Qué necesitas hoy?</Text>
            </View>
          </Pressable>
        </View>

        <CategoryRail onSelect={handleSelectCategory} />

        {!annoncesQuery.isLoading && annonces.length === 0 ? (
          <Text className="px-6 font-sans text-base text-olive-600">
            No hay anuncios abiertos por ahora.
          </Text>
        ) : (
          <>
            <FeedSection
              title="Para ti"
              annonces={forYou}
              posterById={posterById}
              myLocation={myLocation}
              savedIds={savedIds}
              me={me}
              onApply={handleApply}
            />
            <FeedSection
              title="Cerca de ti"
              annonces={nearYou}
              posterById={posterById}
              myLocation={myLocation}
              savedIds={savedIds}
              me={me}
              onApply={handleApply}
            />
            <FeedSection
              title="Recientes"
              annonces={recent}
              posterById={posterById}
              myLocation={myLocation}
              savedIds={savedIds}
              me={me}
              onApply={handleApply}
            />
          </>
        )}
      </ScrollView>

      <ApplySheet
        sheetRef={applySheetRef}
        annonce={applyingAnnonce}
        applicantId={me?.id ?? null}
        onDismiss={() => setApplyingAnnonce(null)}
      />
    </SafeAreaView>
  );
}

function ApplySheet({
  sheetRef,
  annonce,
  applicantId,
  onDismiss,
}: {
  sheetRef: RefObject<BottomSheetModal | null>;
  annonce: Annonce | null;
  applicantId: string | null;
  onDismiss: () => void;
}) {
  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#F7F5EE' }}
      handleIndicatorStyle={{ backgroundColor: '#D8D5C0' }}
      onDismiss={onDismiss}
    >
      <BottomSheetView style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16 }}>
        {annonce && applicantId ? (
          <View className="gap-4">
            <Text className="font-sans-bold text-lg text-ink-900">{annonce.title}</Text>
            <ApplyForm
              annonce={annonce}
              applicantId={applicantId}
              onApplied={() => sheetRef.current?.dismiss()}
            />
          </View>
        ) : null}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

function FeedSection({
  title,
  annonces,
  posterById,
  myLocation,
  savedIds,
  me,
  onApply,
}: {
  title: string;
  annonces: Annonce[];
  posterById: Map<string, Profile>;
  myLocation: Coordinates | null;
  savedIds: Set<string>;
  me: Profile | null;
  onApply: (annonce: Annonce) => void;
}) {
  if (annonces.length === 0) {
    return null;
  }

  return (
    <View className="gap-3">
      <Text className="px-6 font-sans-bold text-lg text-ink-900">{title}</Text>
      <View className="gap-3 px-6">
        {annonces.map((annonce) => (
          <AnnonceFeedCard
            key={annonce.id}
            annonce={annonce}
            poster={posterById.get(annonce.posterId)}
            myLocation={myLocation}
            saved={savedIds.has(annonce.id)}
            me={me}
            onApply={() => onApply(annonce)}
          />
        ))}
      </View>
    </View>
  );
}

function AnnonceFeedCard({
  annonce,
  poster,
  myLocation,
  saved,
  me,
  onApply,
}: {
  annonce: Annonce;
  poster: Profile | undefined;
  myLocation: Coordinates | null;
  saved: boolean;
  me: Profile | null;
  onApply: () => void;
}) {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: () =>
      saved ? unsaveAnnonce(me!.id, annonce.id) : saveAnnonce(me!.id, annonce.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-annonces', me?.id] });
    },
  });

  const handleShare = () => {
    Share.share({
      message: `${annonce.title}\n\n${annonce.description}`,
    });
  };

  const budgetLabel =
    annonce.budgetMin != null && annonce.budgetMax != null
      ? `L ${annonce.budgetMin} - L ${annonce.budgetMax}`
      : null;

  return (
    <View>
      <Pressable onPress={() => router.push(`/annonces/${annonce.id}`)}>
        <Card className="gap-3">
          <View className="flex-row items-center gap-3">
            <Avatar
              src={poster?.avatarUrl}
              initials={poster ? displayNameFor(poster).charAt(0).toUpperCase() || '?' : '?'}
              size={36}
            />
            <View className="flex-1">
              <Text className="font-sans-semibold text-sm text-ink-900">
                {poster ? displayNameFor(poster) : 'Cargando…'}
              </Text>
              <Text className="font-sans text-xs text-olive-600">
                {relativeTimeFromNow(annonce.createdAt)}
              </Text>
            </View>
            <CategoryBadge category={annonce.category} />
          </View>

          <View className="gap-1">
            <Text className="font-sans-semibold text-base text-ink-900">{annonce.title}</Text>
            <Text numberOfLines={2} className="font-sans text-sm text-olive-700">
              {annonce.description}
            </Text>
          </View>

          <View className="flex-row items-center gap-3">
            {budgetLabel ? (
              <Text className="font-sans-semibold text-sm text-ink-900">{budgetLabel}</Text>
            ) : null}
            {myLocation ? (
              <Text className="font-sans text-xs text-olive-600">
                {distanceKm(myLocation, annonce.location).toFixed(1)} km
              </Text>
            ) : null}
            <Text className="font-sans text-xs text-olive-600">
              {annonce.applicationsCount}{' '}
              {annonce.applicationsCount === 1 ? 'aplicante' : 'aplicantes'}
            </Text>
          </View>
        </Card>
      </Pressable>

      {me ? (
        <View className="mt-1 flex-row items-center rounded-md border border-olive-100 bg-white">
          <CardAction
            icon={<Bookmark size={16} color="#14170F" fill={saved ? '#14170F' : 'none'} />}
            label="Guardar"
            onPress={() => saveMutation.mutate()}
          />
          <View className="h-8 w-px bg-olive-100" />
          <CardAction icon={<Send size={16} color="#14170F" />} label="Aplicar" onPress={onApply} />
          <View className="h-8 w-px bg-olive-100" />
          <CardAction
            icon={<Share2 size={16} color="#14170F" />}
            label="Compartir"
            onPress={handleShare}
          />
        </View>
      ) : null}
    </View>
  );
}

function CardAction({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 active:opacity-60"
    >
      {icon}
      <Text className="font-sans-medium text-xs text-ink-900">{label}</Text>
    </Pressable>
  );
}
