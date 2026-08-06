import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useQuery } from '@tanstack/react-query';
import { AppleMaps } from 'expo-maps';
import { Image as ExpoImage, type ImageRef } from 'expo-image';
import { Hand, MapPin, Tag } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image as RNImage,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { listOpenAnnonces, type Annonce } from '../../src/api/annonces';
import { displayNameFor, getProfiles } from '../../src/api/profiles';
import { AnnonceCard } from '../../src/components/annonce-card';
import { CategoryTagPicker } from '../../src/components/category-tag-picker';
import { RadiusStepper } from '../../src/components/radius-stepper';
import { useCurrentProfile } from '../../src/hooks/use-current-profile';
import { distanceKm } from '../../src/lib/distance';
import { DEFAULT_RADIUS_KM } from '../../src/lib/radius';
import type { JobCategory } from '../../src/schemas/job-category';

// San Pedro Sula, Honduras (see GH issue #26 — was previously centered
// elsewhere by mistake).
const SAN_PEDRO_SULA_CAMERA = {
  coordinates: { latitude: 15.5049, longitude: -88.025 },
  zoom: 12.5,
};

// Fixed zoom level used whenever a single profile becomes selected — by tap
// or by swiping the card slider — instead of "current zoom + 2", so browsing
// several profiles in a row settles on a stable, readable level rather than
// zooming in further with every step.
const PROFILE_ZOOM = SAN_PEDRO_SULA_CAMERA.zoom + 2;

type ResolvedIcon = ImageRef;

type Cluster = {
  id: string;
  lat: number;
  lng: number;
  annonces: Annonce[];
  // True when every annonce in the cluster sits within SAME_ADDRESS_EPSILON_KM
  // of the centroid — i.e. they're effectively at the exact same address, not
  // just nearby. Zooming in can never split a cluster like this apart (the
  // clustering threshold shrinks with zoom but never reaches zero), so it
  // needs a different tap behavior and a different pin — see onAnnotationClick.
  sameAddress: boolean;
};

// Below this distance from a cluster's centroid, annonces are treated as
// being at the same address rather than merely nearby.
const SAME_ADDRESS_EPSILON_KM = 0.02;

// Greedy single-pass grouping: each annonce joins the first existing cluster
// within thresholdKm of its running centroid, else starts a new one. Good
// enough for the handful of open annonces a neighborhood map shows at once.
function clusterAnnonces(annonces: Annonce[], thresholdKm: number): Cluster[] {
  const clusters: Omit<Cluster, 'sameAddress'>[] = [];
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
  return clusters.map((cluster) => ({
    ...cluster,
    sameAddress: cluster.annonces.every(
      (annonce) =>
        distanceKm({ lat: cluster.lat, lng: cluster.lng }, annonce.location) <
        SAME_ADDRESS_EPSILON_KM,
    ),
  }));
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

// Same rasterize-to-circle trick as ClusterBadgeLoader, but for a
// same-address stack (see Cluster.sameAddress) — offers that sit at the
// exact same location, which zooming in can never split apart. Deliberately
// styled as a rounded *square* in the accent color, not a circle, so it
// reads as a different kind of pin at a glance: tapping it opens the swipe
// slider straight away instead of zooming the map further.
function StackBadgeLoader({
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
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#D6F24C',
        borderWidth: 3,
        borderColor: '#FFFFFF',
      }}
    >
      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 20, color: '#14170F' }}>
        ×{count}
      </Text>
    </View>
  );
}

// Same rasterize-to-circle trick as AvatarCircleLoader, used when a poster
// has no avatarUrl — matches Avatar's own fallback (src/components/avatar.tsx):
// an olive-200 circle with the poster's initial, instead of the default map
// pin. Deduped by initial (not poster id) since visually identical circles
// only need rasterizing once, same as ClusterBadgeLoader deduping by count.
function InitialsCircleLoader({
  initial,
  onReady,
}: {
  initial: string;
  onReady: (initial: string, image: ResolvedIcon) => void;
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
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        captureRef(viewRef, { format: 'png', result: 'tmpfile' })
          .then((uri) => ExpoImage.loadAsync(uri, { maxWidth: 128, maxHeight: 128 }))
          .then((image) => {
            if (!cancelled) {
              setDone(true);
              onReady(initial, image);
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
  }, [laidOut, done, initial, onReady]);

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
        backgroundColor: '#D8D5C0', // olive-200
        borderWidth: 3,
        borderColor: '#FFFFFF',
      }}
    >
      <Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 24, color: '#14170F' }}>
        {initial}
      </Text>
    </View>
  );
}

export default function JoblistScreen() {
  const meQuery = useCurrentProfile();
  const me = meQuery.data ?? null;
  const myLocation = me?.location ?? null;
  const mapRef = useRef<AppleMaps.MapView>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);

  const annoncesQuery = useQuery({
    queryKey: ['annonces', 'open'],
    queryFn: () => listOpenAnnonces(),
  });

  // Work-area filter (GH #37): radius defaults to the provider's own
  // service_radius_km (their "usual" travel zone) so the map starts scoped
  // to what they'd normally accept, but stays editable for e.g. a trip out
  // of town. Categories default to the profile's category_tags. Both are
  // seeded from `me` exactly once it loads, then left alone — an empty
  // category selection means "no restriction" (same semantics as the
  // profile-edit picker), not "show nothing".
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [categoryFilter, setCategoryFilter] = useState<JobCategory[]>([]);
  const didSeedFiltersRef = useRef(false);
  useEffect(() => {
    if (didSeedFiltersRef.current || !me) {
      return;
    }
    didSeedFiltersRef.current = true;
    setRadiusKm(me.serviceRadiusKm ?? DEFAULT_RADIUS_KM);
    setCategoryFilter(me.categoryTags);
  }, [me]);

  const annonces = useMemo(
    () =>
      (annoncesQuery.data ?? []).filter((annonce) => {
        if (annonce.posterId === me?.id) {
          return false;
        }
        if (categoryFilter.length > 0 && !categoryFilter.includes(annonce.category)) {
          return false;
        }
        if (myLocation && distanceKm(myLocation, annonce.location) > radiusKm) {
          return false;
        }
        return true;
      }),
    [annoncesQuery.data, me?.id, categoryFilter, myLocation, radiusKm],
  );

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

  const posterInitials = useMemo(
    () =>
      Array.from(
        new Set(
          (postersQuery.data ?? [])
            .filter((profile) => profile.avatarUrl == null)
            .map((profile) => displayNameFor(profile).charAt(0).toUpperCase() || '?'),
        ),
      ),
    [postersQuery.data],
  );

  const [initialsIcons, setInitialsIcons] = useState<Map<string, ResolvedIcon>>(new Map());
  const handleInitialsIconReady = (initial: string, image: ResolvedIcon) => {
    setInitialsIcons((prev) => (prev.has(initial) ? prev : new Map(prev).set(initial, image)));
  };

  const [badgeIcons, setBadgeIcons] = useState<Map<number, ResolvedIcon>>(new Map());
  const handleBadgeIconReady = (count: number, image: ResolvedIcon) => {
    setBadgeIcons((prev) => (prev.has(count) ? prev : new Map(prev).set(count, image)));
  };

  const [stackIcons, setStackIcons] = useState<Map<number, ResolvedIcon>>(new Map());
  const handleStackIconReady = (count: number, image: ResolvedIcon) => {
    setStackIcons((prev) => (prev.has(count) ? prev : new Map(prev).set(count, image)));
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
      Array.from(
        new Set(
          clusters
            .filter((cluster) => cluster.annonces.length > 1 && !cluster.sameAddress)
            .map((c) => c.annonces.length),
        ),
      ),
    [clusters],
  );

  const stackCounts = useMemo(
    () =>
      Array.from(
        new Set(
          clusters
            .filter((cluster) => cluster.annonces.length > 1 && cluster.sameAddress)
            .map((c) => c.annonces.length),
        ),
      ),
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
  const selectedIndex = selectedId
    ? sortedAnnonces.findIndex((annonce) => annonce.id === selectedId)
    : -1;

  const focusAnnonce = (annonce: Annonce) => {
    mapRef.current?.setCameraPosition({
      coordinates: { latitude: annonce.location.lat, longitude: annonce.location.lng },
      zoom: PROFILE_ZOOM,
    });
  };

  // Card spans the full screen width (no side margins), so pagingEnabled
  // below snaps exactly one card per swipe.
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth;

  const sliderRef = useRef<FlatList<Annonce>>(null);
  // Tracks which selection change originated from the slider itself, so the
  // sync effect below only programmatically scrolls when selection changed
  // some other way (a map pin tap) — otherwise every user swipe would
  // immediately trigger a redundant scrollToIndex back to where it already is.
  const scrollOriginIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedId || selectedIndex === -1 || scrollOriginIdRef.current === selectedId) {
      return;
    }
    scrollOriginIdRef.current = selectedId;
    sliderRef.current?.scrollToIndex({ index: selectedIndex, animated: true });
  }, [selectedId, selectedIndex]);

  // Shows a hand icon sliding left/right over the slider once, the first
  // time it appears, so the card's horizontal swipeability isn't purely
  // undiscoverable. Overlaid via `showSwipeHint`/`pointerEvents="none"`
  // rather than moving the card itself, so it never interferes with the
  // real swipe gesture.
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [handX] = useState(() => new Animated.Value(0));
  const [handOpacity] = useState(() => new Animated.Value(0));
  const hasShownSwipeHintRef = useRef(false);
  useEffect(() => {
    if (!selectedId || hasShownSwipeHintRef.current) {
      return;
    }
    hasShownSwipeHintRef.current = true;
    setShowSwipeHint(true);
    // Easing.inOut on every leg (rather than the default linear-ish curve)
    // so the hand accelerates out of and decelerates into each direction
    // change instead of visibly snapping at the turnarounds.
    const ease = Easing.inOut(Easing.ease);
    Animated.sequence([
      Animated.timing(handOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(handX, { toValue: -30, duration: 520, easing: ease, useNativeDriver: true }),
      Animated.timing(handX, { toValue: 0, duration: 460, easing: ease, useNativeDriver: true }),
      Animated.timing(handX, { toValue: 30, duration: 520, easing: ease, useNativeDriver: true }),
      Animated.timing(handX, { toValue: 0, duration: 460, easing: ease, useNativeDriver: true }),
      Animated.timing(handOpacity, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => setShowSwipeHint(false));
  }, [selectedId, handX, handOpacity]);

  const annotations: AppleMaps.Annotation[] = clusters.map((cluster) => {
    if (cluster.annonces.length > 1) {
      const icon = cluster.sameAddress
        ? stackIcons.get(cluster.annonces.length)
        : badgeIcons.get(cluster.annonces.length);
      return {
        id: cluster.id,
        coordinates: { latitude: cluster.lat, longitude: cluster.lng },
        icon: icon ?? undefined,
      };
    }

    const annonce = cluster.annonces[0];
    const poster = posterById.get(annonce.posterId);
    const initial = poster ? displayNameFor(poster).charAt(0).toUpperCase() || '?' : '?';
    const icon = poster?.avatarUrl ? avatarIcons.get(poster.avatarUrl) : initialsIcons.get(initial);
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
      {stackCounts.map((count) => (
        <StackBadgeLoader key={count} count={count} onReady={handleStackIconReady} />
      ))}
      {posterInitials.map((initial) => (
        <InitialsCircleLoader key={initial} initial={initial} onReady={handleInitialsIconReady} />
      ))}

      <View className="gap-3 px-6 pb-4 pt-6">
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => filterSheetRef.current?.present()}
            className="flex-row items-center gap-1.5 rounded-full border border-olive-200 bg-white px-4 py-2"
          >
            <MapPin size={14} color="#14170F" />
            <Text className="font-sans-medium text-sm text-ink-900">{radiusKm} km</Text>
          </Pressable>
          <Pressable
            onPress={() => filterSheetRef.current?.present()}
            className="flex-row items-center gap-1.5 rounded-full border border-olive-200 bg-white px-4 py-2"
          >
            <Tag size={14} color="#14170F" />
            <Text className="font-sans-medium text-sm text-ink-900">
              {categoryFilter.length === 0
                ? 'Todas las categorías'
                : `${categoryFilter.length} categorías`}
            </Text>
          </Pressable>
        </View>
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
                if (cluster.sameAddress) {
                  // Zooming in can never split annonces that share an exact
                  // address apart (see Cluster.sameAddress) — open the slider
                  // on the first one instead, so the user can swipe between
                  // them right away rather than tapping a pin that never
                  // visibly reacts.
                  const annonce = cluster.annonces[0];
                  setSelectedId(annonce.id);
                  focusAnnonce(annonce);
                  return;
                }
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
            <View className="absolute inset-x-0 bottom-4">
              <FlatList
                ref={sliderRef}
                data={sortedAnnonces}
                keyExtractor={(annonce) => annonce.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={selectedIndex >= 0 ? selectedIndex : 0}
                getItemLayout={(_, index) => ({
                  length: cardWidth,
                  offset: cardWidth * index,
                  index,
                })}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
                  const annonce = sortedAnnonces[index];
                  if (annonce && annonce.id !== selectedId) {
                    scrollOriginIdRef.current = annonce.id;
                    setSelectedId(annonce.id);
                    focusAnnonce(annonce);
                  }
                }}
                renderItem={({ item: annonce }) => (
                  <View style={{ width: cardWidth, paddingHorizontal: 16 }}>
                    <AnnonceCard
                      annonce={annonce}
                      poster={posterById.get(annonce.posterId)}
                      myLocation={myLocation}
                    />
                  </View>
                )}
              />

              {showSwipeHint ? (
                <Animated.View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: handOpacity,
                    transform: [{ translateX: handX }],
                  }}
                >
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-ink-900/85">
                    <Hand size={22} strokeWidth={1.75} color="#FFFFFF" />
                  </View>
                </Animated.View>
              ) : null}
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

      <FilterSheet
        sheetRef={filterSheetRef}
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        categories={categoryFilter}
        onCategoriesChange={setCategoryFilter}
        hasLocation={myLocation != null}
      />
    </SafeAreaView>
  );
}

function FilterSheet({
  sheetRef,
  radiusKm,
  onRadiusChange,
  categories,
  onCategoriesChange,
  hasLocation,
}: {
  sheetRef: RefObject<BottomSheetModal | null>;
  radiusKm: number;
  onRadiusChange: (radiusKm: number) => void;
  categories: JobCategory[];
  onCategoriesChange: (categories: JobCategory[]) => void;
  hasLocation: boolean;
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
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#F7F5EE' }}
      handleIndicatorStyle={{ backgroundColor: '#D8D5C0' }}
    >
      <BottomSheetView style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 16 }}>
        <View className="gap-6 pb-2">
          <View className="gap-2">
            <Text className="font-sans-bold text-lg text-ink-900">Radio de búsqueda</Text>
            <Text className="font-sans text-sm text-olive-600">
              {hasLocation
                ? 'Distancia desde tu dirección guardada.'
                : 'Guarda tu dirección en tu perfil para activar este filtro.'}
            </Text>
            <RadiusStepper value={radiusKm} onChange={onRadiusChange} />
          </View>

          <View className="gap-2">
            <Text className="font-sans-bold text-lg text-ink-900">Categorías</Text>
            <Text className="font-sans text-sm text-olive-600">
              Muestra solo estos sectores. Puedes no elegir ninguna para verlos todos.
            </Text>
            <CategoryTagPicker value={categories} onChange={onCategoriesChange} />
          </View>

          <Pressable
            onPress={() => sheetRef.current?.dismiss()}
            className="h-12 items-center justify-center rounded-full bg-accent"
          >
            <Text className="font-sans-bold text-base text-ink-900">Listo</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
