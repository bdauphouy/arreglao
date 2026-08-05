import { useMutation, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Award, CheckCircle2, GraduationCap, MapPin } from 'lucide-react-native';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { getAnnonce } from '../../src/api/annonces';
import { getOrCreateConversation } from '../../src/api/conversations';
import { displayNameFor, getProfile } from '../../src/api/profiles';
import { computeReviewStats, listReviewsForProfile } from '../../src/api/reviews';
import { Avatar } from '../../src/components/avatar';
import { Badge } from '../../src/components/badge';
import { Button } from '../../src/components/button';
import { Card } from '../../src/components/card';
import { LocationPreview } from '../../src/components/location-preview';
import { RatingBreakdown } from '../../src/components/rating-breakdown';
import { ReviewCard } from '../../src/components/review-card';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
import { JOB_CATEGORY_LABELS } from '../../src/lib/job-categories';
import { yearsSince } from '../../src/lib/relative-time';

export default function ProfileScreen() {
  const { id, annonceId } = useLocalSearchParams<{ id: string; annonceId?: string }>();
  const insets = useSafeAreaInsets();

  const profileQuery = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getProfile(id),
    enabled: !!id,
  });

  const reviewsQuery = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => listReviewsForProfile(id),
    enabled: !!id,
  });

  const meQuery = useCurrentProfile();

  const annonceQuery = useQuery({
    queryKey: ['annonce', annonceId],
    queryFn: () => getAnnonce(annonceId as string),
    enabled: !!annonceId,
  });

  const messageMutation = useMutation({
    mutationFn: () => getOrCreateConversation(annonceId as string, annonceQuery.data!.posterId, id),
    onSuccess: (conversation) => {
      router.push(`/messages/${conversation.id}`);
    },
  });

  if (!profileQuery.data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-sand">
        <Text className="font-sans text-base text-olive-600">
          {profileQuery.isError ? 'No se pudo cargar este perfil.' : 'Cargando…'}
        </Text>
      </SafeAreaView>
    );
  }

  const profile = profileQuery.data;
  const displayName = displayNameFor(profile);
  const reviews = reviewsQuery.data ?? [];
  const stats = computeReviewStats(reviews);
  const photos = reviews
    .map((review) => review.photoUrl)
    .filter((url): url is string => url != null);
  const primaryCategoryLabel = profile.categoryTags[0]
    ? JOB_CATEGORY_LABELS[profile.categoryTags[0]]
    : null;

  const canMessage =
    !!annonceId &&
    !!meQuery.data &&
    !!annonceQuery.data &&
    meQuery.data.id === annonceQuery.data.posterId &&
    meQuery.data.id !== profile.id;

  return (
    <View className="flex-1 bg-sand">
      <ScrollView contentContainerClassName="pb-28" showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: insets.top + 8 }} className="px-4">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="h-8 w-8 items-center justify-center"
          >
            <ArrowLeft size={22} strokeWidth={1.75} color="#14170F" />
          </Pressable>
        </View>

        <View className="items-center gap-3 px-6 pb-6 pt-2">
          <Avatar
            src={profile.avatarUrl}
            initials={displayName.charAt(0).toUpperCase() || '?'}
            size={112}
            ring
          />
          <View className="items-center gap-1">
            <Text className="font-sans-extrabold text-2xl text-ink-900">
              {displayName || 'Sin nombre'}
            </Text>
            {primaryCategoryLabel ? (
              <Text className="font-sans-medium text-base text-olive-600">
                {primaryCategoryLabel}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-row items-center justify-around border-y border-olive-100 bg-white px-6 py-4">
          <StatItem value={String(profile.reviewCount)} label="Evaluaciones" />
          <View className="h-8 w-px bg-olive-100" />
          <StatItem
            value={profile.averageRating != null ? profile.averageRating.toFixed(2) : '—'}
            label="Calificación de 5"
          />
          <View className="h-8 w-px bg-olive-100" />
          <StatItem value={String(yearsSince(profile.createdAt))} label="años en arreglao" />
        </View>

        <View className="gap-6 px-6 pt-6">
          {profile.isTopProvider ? (
            <Card className="flex-row items-start gap-3 bg-accent/10">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-accent">
                <Award size={18} color="#14170F" />
              </View>
              <View className="flex-1 gap-1">
                <Text className="font-sans-bold text-base text-ink-900">Proveedor superior</Text>
                <Text className="font-sans text-sm text-olive-700">
                  Este distintivo destaca a los proveedores de servicios más competentes y mejor
                  valorados en arreglao.
                </Text>
              </View>
            </Card>
          ) : null}

          {profile.certification || profile.experienceYears != null ? (
            <View className="gap-2">
              {profile.certification ? (
                <View className="flex-row items-center gap-3">
                  <GraduationCap size={18} color="#14170F" />
                  <Text className="flex-1 font-sans text-sm text-ink-900">
                    {profile.certification}
                  </Text>
                </View>
              ) : null}
              {profile.experienceYears != null ? (
                <View className="flex-row items-center gap-3">
                  <Award size={18} color="#14170F" />
                  <Text className="flex-1 font-sans text-sm text-ink-900">
                    +{profile.experienceYears} años de experiencia
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {profile.bio ? (
            <View className="gap-2">
              <Text className="font-sans-bold text-lg text-ink-900">Sobre mí</Text>
              <Text className="font-sans text-base text-olive-700">{profile.bio}</Text>
            </View>
          ) : null}

          {profile.commitmentTags.length > 0 ? (
            <View className="gap-2">
              <Text className="font-sans-bold text-lg text-ink-900">
                Mis compromisos con los clientes
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {profile.commitmentTags.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </View>
            </View>
          ) : null}

          {profile.equipmentTags.length > 0 ? (
            <View className="gap-2">
              <Text className="font-sans-bold text-lg text-ink-900">Equipo</Text>
              <View className="flex-row flex-wrap gap-2">
                {profile.equipmentTags.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </View>
            </View>
          ) : null}

          {stats.reviewCount > 0 ? <RatingBreakdown stats={stats} /> : null}

          {photos.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6">
              <View className="flex-row gap-3 px-6">
                {photos.map((url, index) => (
                  <Image
                    key={`${url}-${index}`}
                    source={{ uri: url }}
                    className="h-28 w-28 rounded-md"
                    resizeMode="cover"
                  />
                ))}
              </View>
            </ScrollView>
          ) : null}

          {reviews.length > 0 ? (
            <View className="-mx-6 gap-2">
              <Text className="font-sans-bold text-lg text-ink-900 px-6">Valoraciones</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3 px-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : null}

          {profile.location ? (
            <View className="gap-2">
              <Text className="font-sans-bold text-lg text-ink-900">Área de intervención</Text>
              {profile.serviceRadiusKm != null ? (
                <View className="flex-row items-center gap-2">
                  <MapPin size={16} color="#5E5C49" />
                  <Text className="font-sans text-sm text-olive-600">
                    {profile.serviceRadiusKm} km a la redonda
                  </Text>
                </View>
              ) : null}
              <LocationPreview location={profile.location} />
            </View>
          ) : null}

          {profile.identityVerified || profile.phoneVerified ? (
            <View className="gap-2">
              <Text className="font-sans-bold text-lg text-ink-900">Información verificada</Text>
              {profile.identityVerified ? (
                <View className="flex-row items-center gap-3">
                  <CheckCircle2 size={18} color="#3F8F5E" />
                  <Text className="font-sans text-sm text-ink-900">Identidad verificada</Text>
                </View>
              ) : null}
              {profile.phoneVerified ? (
                <View className="flex-row items-center gap-3">
                  <CheckCircle2 size={18} color="#3F8F5E" />
                  <Text className="font-sans text-sm text-ink-900">
                    Número de teléfono verificado
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>

      {canMessage ? (
        <SafeAreaView
          edges={['bottom']}
          className="absolute inset-x-0 bottom-0 border-t border-olive-100 bg-white px-6 pt-3"
        >
          <Button
            size="lg"
            onPress={() => messageMutation.mutate()}
            disabled={messageMutation.isPending}
          >
            {messageMutation.isPending ? 'Abriendo…' : 'Enviar mensaje'}
          </Button>
        </SafeAreaView>
      ) : null}
    </View>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View className="items-center gap-1">
      <Text className="font-sans-extrabold text-lg text-ink-900">{value}</Text>
      <Text className="font-sans text-xs text-olive-600">{label}</Text>
    </View>
  );
}
