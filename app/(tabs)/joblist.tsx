import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { AppleMaps } from 'expo-maps';
import { Image as ExpoImage, type ImageRef } from 'expo-image';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image as RNImage, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { listOpenAnnonces, type Annonce } from '../../src/api/annonces';
import { displayNameFor, getProfiles } from '../../src/api/profiles';
import { Avatar } from '../../src/components/avatar';
import { CategoryBadge } from '../../src/components/category-badge';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
import { distanceKm } from '../../src/lib/distance';

// San Pedro Sula, Honduras (see GH issue #26 — was previously centered
// elsewhere by mistake).
const SAN_PEDRO_SULA_CAMERA = { coordinates: { latitude: 15.5049, longitude: -88.025 }, zoom: 12.5 };

// Fixed zoom level used whenever a single profile becomes selected — by tap
// or by stepping through the prev/next arrows — instead of "current zoom +
// 2", so browsing several profiles in a row settles on a stable, readable
// level rather than zooming in further with every step.
const PROFILE_ZOOM = SAN_PEDRO_SULA_CAMERA.zoom + 2;

type ResolvedIcon = ImageRef;

type Cluster = {
  id: string;
  lat: number;
  lng: number;
  annonces: Annonce[];
};

// Greedy single-pass grouping: each annonce joins the first existing cluster
// within thresholdKm of its running centroid, else starts a new one. Good
// enough for the handful of open annonces a neighborhood map shows at once.
function clusterAnnonces(annonces: Annonce[], thresholdKm: number): Cluster[] {
  const clusters: Cluster[] = [];
  for (const annonce of annonces) {
    const nearby = clusters.find(
      (cluster) =>
        distanceKm({ lat: cluster.lat, lng: cluster.lng }, annonce.location) < thresholdKm,
    );
    if (nearby) {
      nearby.annonces.push(annonce);
      const count = nearby.annonces.length;
      nearby.lat += (annonce.location.lat - nearby.lat) / count;
      nearby.lng += (annonce.location.lng - nearby.lng) / count;
    } else {
      clusters.push({
        id: annonce.id,
        lat: annonce.location.lat,
        lng: annonce.location.lng,
        annonces: [annonce],
      });
    }
  }
  return clusters;
}

// expo-maps draws a plain 50x50 square for annotation `icon`s (no clip
// shape) — see AppleMapsViewiOS18.swift. To get a circular pin we rasterize
// a circularly-clipped RN view to a PNG (via react-native-view-shot) and
// feed that image in as the icon, instead of the raw square avatar.
function AvatarCircleLoader({
  url,
  onReady,
}: {
  url: string;
  onReady: (url: string, image: ResolvedIcon) => void;
}) {
  const viewRef = useRef<View>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [laidOut, setLaidOut] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!imageLoaded || !laidOut || done) {
      return;
    }
    let cancelled = false;
    let secondFrame: number | null = null;
    // Wait two frames past layout+image-load before snapshotting: the
    // borderRadius/overflow clip is applied via a native layer mask that
    // commits a beat after layout, so capturing immediately can catch the
    // view mid-render and yield an unclipped square — the exact same
    // "capture fired too early" issue as ClusterBadgeLoader, just less
    // total failure (a snapshot was still produced, only unclipped).
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        captureRef(viewRef, { format: 'png', result: 'tmpfile' })
          .then((uri) => ExpoImage.loadAsync(uri, { maxWidth: 128, maxHeight: 128 }))
          .then((image) => {
            if (!cancelled) {
              setDone(true);
              onReady(url, image);
            }
          })
          .catch(() => {});
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      if (secondFrame != null) {
        cancelAnimationFrame(secondFrame);
      }
    };
  }, [imageLoaded, laidOut, done, url, onReady]);

  return (
    <View
      ref={viewRef}
      collapsable={false}
      onLayout={() => setLaidOut(true)}
      style={{
        position: 'absolute',
        top: -1000,
        left: -1000,
        width: 64,
        height: 64,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        backgroundColor: '#EAE8DA',
      }}
    >
      <RNImage
        source={{ uri: url }}
        style={{ width: 64, height: 64 }}
        resizeMode="cover"
        onLoadEnd={() => setImageLoaded(true)}
      />
    </View>
  );
}

// Same rasterize-to-circle trick as AvatarCircleLoader, but for the
// "N nearby profiles" cluster badge instead of a photo.
function ClusterBadgeLoader({
  count,
  onReady,
}: {
  count: number;
  onReady: (count: number, image: ResolvedIcon) => void;
}) {
  const viewRef = useRef<View>(null);
  const [laidOut, setLaidOut] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!laidOut || done) {
      return;
    }
    let cancelled = false;
    let secondFrame: number | null = null;
    // Wait two frames past layout before snapshotting: without any wait at
    // all, captureRef fired before the offscreen view had completed a
    // native layout pass and reliably failed (silently, via the catch
    // below), which is why cluster badges never appeared at all. Loading
    // the captured PNG imperatively (instead of through the useImage hook)
    // also avoids the hook briefly keeping its previous resolved image
    // around while the new one decodes — which was leaking a stale
    // placeholder image onto the map as the badge icon.
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        captureRef(viewRef, { format: 'png', result: 'tmpfile' })
          .then((uri) => ExpoImage.loadAsync(uri, { maxWidth: 128, maxHeight: 128 }))
          .then((image) => {
            if (!cancelled) {
              setDone(true);
              onReady(count, image);
            }
          })
          .catch(() => {});
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(firstFrame);
      if (secondFrame != null) {
        cancelAnimationFrame(secondFrame);
      }
    };
  }, [laidOut, done, count, onReady]);

  return (
    <View
      ref={viewRef}
      collapsable={false}
      onLayout={() => setLaidOut(true)}
      style={{
        position: 'absolute',
        top: -1000,
        left: -1000,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#14170F',
        borderWidth: 3,
        borderColor: '#FFFFFF',
      }}
    >
      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 22, color: '#D6F24C' }}>
        {count}
      </Text>
    </View>
  );
}

export default function JoblistScreen() {
  const meQuery = useCurrentProfile();
  const myLocation = meQuery.data?.location ?? null;
  const mapRef = useRef<AppleMaps.MapView>(null);

  const annoncesQuery = useQuery({
    queryKey: ['annonces', 'open'],
    queryFn: () => listOpenAnnonces(),
  });
  const annonces = useMemo(() => annoncesQuery.data ?? [], [annoncesQuery.data]);

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

  const avatarUrls = useMemo(
    () =>
      Array.from(
        new Set(
          (postersQuery.data ?? [])
            .map((profile) => profile.avatarUrl)
            .filter((url): url is string => url != null),
        ),
      ),
    [postersQuery.data],
  );

  const [avatarIcons, setAvatarIcons] = useState<Map<string, ResolvedIcon>>(new Map());
  const handleAvatarIconReady = (url: string, image: ResolvedIcon) => {
    setAvatarIcons((prev) => (prev.has(url) ? prev : new Map(prev).set(url, image)));
  };

  const [badgeIcons, setBadgeIcons] = useState<Map<number, ResolvedIcon>>(new Map());
  const handleBadgeIconReady = (count: number, image: ResolvedIcon) => {
    setBadgeIcons((prev) => (prev.has(count) ? prev : new Map(prev).set(count, image)));
  };

  const [region, setRegion] = useState<{ zoom: number; latitudeDelta: number } | null>(null);
  const regionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (regionDebounceRef.current) {
        clearTimeout(regionDebounceRef.current);
      }
    };
  }, []);

  const clusters = useMemo(() => {
    // Roughly group pins that would overlap on screen: threshold shrinks as
    // the visible latitude span shrinks (i.e. as the user zooms in), so
    // clusters split apart into their distinct profiles on zoom. Rounded to
    // the nearest 0.05° so tiny camera jitter (a couple pixels of drift
    // during the initial fly-to animation) doesn't flip a point in and out
    // of a cluster on every frame.
    const latitudeDelta = Math.round((region?.latitudeDelta ?? 0.35) * 20) / 20;
    const thresholdKm = latitudeDelta * 111 * 0.07;
    return clusterAnnonces(annonces, thresholdKm);
  }, [annonces, region]);

  const clusterCounts = useMemo(
    () =>
      Array.from(new Set(clusters.filter((cluster) => cluster.annonces.length > 1).map((c) => c.annonces.length))),
    [clusters],
  );

  const sortedAnnonces = useMemo(() => {
    if (!myLocation) {
      return annonces;
    }
    return annonces
      .slice()
      .sort((a, b) => distanceKm(myLocation, a.location) - distanceKm(myLocation, b.location));
  }, [annonces, myLocation]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedAnnonce = annonces.find((annonce) => annonce.id === selectedId) ?? null;
  const selectedPoster = selectedAnnonce ? posterById.get(selectedAnnonce.posterId) : undefined;
  const selectedIndex = selectedId ? sortedAnnonces.findIndex((annonce) => annonce.id === selectedId) : -1;

  const focusAnnonce = (annonce: Annonce) => {
    mapRef.current?.setCameraPosition({
      coordinates: { latitude: annonce.location.lat, longitude: annonce.location.lng },
      zoom: PROFILE_ZOOM,
    });
  };

  const selectNeighbor = (delta: 1 | -1) => {
    if (selectedIndex === -1) {
      return;
    }
    const nextIndex = selectedIndex + delta;
    const nextAnnonce = sortedAnnonces[nextIndex];
    if (!nextAnnonce) {
      return;
    }
    setSelectedId(nextAnnonce.id);
    focusAnnonce(nextAnnonce);
  };

  const annotations: AppleMaps.Annotation[] = clusters.map((cluster) => {
    if (cluster.annonces.length > 1) {
      const icon = badgeIcons.get(cluster.annonces.length);
      return {
        id: cluster.id,
        coordinates: { latitude: cluster.lat, longitude: cluster.lng },
        icon: icon ?? undefined,
      };
    }

    const annonce = cluster.annonces[0];
    const poster = posterById.get(annonce.posterId);
    const icon = poster?.avatarUrl ? avatarIcons.get(poster.avatarUrl) : undefined;
    return {
      id: annonce.id,
      coordinates: { latitude: annonce.location.lat, longitude: annonce.location.lng },
      icon: icon ?? undefined,
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-sand" edges={['top', 'left', 'right']}>
      {avatarUrls.map((url) => (
        <AvatarCircleLoader key={url} url={url} onReady={handleAvatarIconReady} />
      ))}
      {clusterCounts.map((count) => (
        <ClusterBadgeLoader key={count} count={count} onReady={handleBadgeIconReady} />
      ))}

      <View className="gap-1 px-6 pb-4 pt-6">
        <Text className="font-sans-extrabold text-2xl text-ink-900">Mapa de trabajos</Text>
        <Text className="font-sans text-sm text-olive-600">
          {annonces.length} anuncios abiertos
        </Text>
      </View>

      {Platform.OS === 'ios' ? (
        <View className="flex-1">
          <AppleMaps.View
            ref={mapRef}
            style={{ flex: 1 }}
            cameraPosition={SAN_PEDRO_SULA_CAMERA}
            annotations={annotations}
            onCameraMove={(event) => {
              // Debounced so clusters/badges only recompute once the camera
              // is actually at rest — recomputing on every intermediate
              // tick of a fly-to/pan animation was constantly reshuffling
              // cluster groupings and remounting the badge loaders before
              // their rasterize-to-PNG capture could finish.
              if (regionDebounceRef.current) {
                clearTimeout(regionDebounceRef.current);
              }
              regionDebounceRef.current = setTimeout(() => {
                setRegion({ zoom: event.zoom, latitudeDelta: event.latitudeDelta });
              }, 250);
            }}
            onAnnotationClick={(annotation) => {
              const cluster = clusters.find((c) => c.id === annotation.id);
              if (!cluster) {
                return;
              }
              if (cluster.annonces.length > 1) {
                mapRef.current?.setCameraPosition({
                  coordinates: { latitude: cluster.lat, longitude: cluster.lng },
                  zoom: (region?.zoom ?? SAN_PEDRO_SULA_CAMERA.zoom) + 2,
                });
                return;
              }
              const annonce = cluster.annonces[0];
              setSelectedId(annonce.id);
              focusAnnonce(annonce);
            }}
          />

          {selectedAnnonce ? (
            <View className="absolute inset-x-4 bottom-4 flex-row items-center gap-2">
              <Pressable
                onPress={() => selectNeighbor(-1)}
                disabled={selectedIndex <= 0}
                hitSlop={8}
                className="h-9 w-9 items-center justify-center rounded-full border border-olive-100 bg-white shadow-sm"
                style={{ opacity: selectedIndex <= 0 ? 0.35 : 1 }}
              >
                <ChevronLeft size={20} strokeWidth={1.75} color="#14170F" />
              </Pressable>

              <View className="flex-1 gap-2 rounded-md border border-olive-100 bg-white p-4 shadow-sm">
                <Pressable
                  onPress={() => selectedPoster && router.push(`/profile/${selectedPoster.id}`)}
                  className="flex-row items-center gap-3"
                >
                  <Avatar
                    src={selectedPoster?.avatarUrl}
                    initials={
                      selectedPoster
                        ? displayNameFor(selectedPoster).charAt(0).toUpperCase() || '?'
                        : '?'
                    }
                    size={44}
                  />
                  <View className="flex-1">
                    <Text numberOfLines={1} className="font-sans-semibold text-base text-ink-900">
                      {selectedPoster ? displayNameFor(selectedPoster) : 'Cargando…'}
                    </Text>
                    {selectedPoster?.averageRating != null ? (
                      <Text className="font-sans text-xs text-olive-600">
                        ★ {selectedPoster.averageRating.toFixed(1)}
                      </Text>
                    ) : null}
                  </View>
                  <CategoryBadge category={selectedAnnonce.category} />
                </Pressable>

                <Pressable onPress={() => router.push(`/annonces/${selectedAnnonce.id}`)} className="gap-1">
                  <Text numberOfLines={1} className="font-sans-semibold text-base text-ink-900">
                    {selectedAnnonce.title}
                  </Text>
                  <Text numberOfLines={2} className="font-sans text-sm text-olive-700">
                    {selectedAnnonce.description}
                  </Text>
                  <View className="flex-row items-center gap-2 pt-1">
                    {selectedAnnonce.budgetMin != null && selectedAnnonce.budgetMax != null ? (
                      <Text className="font-sans-semibold text-sm text-ink-900">
                        L {selectedAnnonce.budgetMin} - L {selectedAnnonce.budgetMax}
                      </Text>
                    ) : null}
                    {myLocation ? (
                      <Text className="font-sans text-xs text-olive-600">
                        {distanceKm(myLocation, selectedAnnonce.location).toFixed(1)} km
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              </View>

              <Pressable
                onPress={() => selectNeighbor(1)}
                disabled={selectedIndex === -1 || selectedIndex >= sortedAnnonces.length - 1}
                hitSlop={8}
                className="h-9 w-9 items-center justify-center rounded-full border border-olive-100 bg-white shadow-sm"
                style={{
                  opacity: selectedIndex === -1 || selectedIndex >= sortedAnnonces.length - 1 ? 0.35 : 1,
                }}
              >
                <ChevronRight size={20} strokeWidth={1.75} color="#14170F" />
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center bg-olive-50 px-6">
          <Text className="text-center font-sans text-sm text-olive-600">
            El mapa todavía no está disponible en Android.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
