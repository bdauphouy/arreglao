import { useQuery } from '@tanstack/react-query';

import { listHelpers } from '../api/profiles';
import { DEFAULT_HELPERS_RADIUS_KM } from '../lib/radius';
import { useCurrentProfile } from './use-current-profile';

// Shared by the Helpers tab and its per-category "Ver todos" screen (GH
// #38) so both scope to the same default 20km radius instead of drifting.
export function useNearbyHelpers() {
  const meQuery = useCurrentProfile();
  const myLocation = meQuery.data?.location ?? null;

  const helpersQuery = useQuery({
    queryKey: ['helpers', meQuery.data?.id, myLocation],
    queryFn: () =>
      listHelpers(
        meQuery.data?.id,
        myLocation ? { center: myLocation, radiusKm: DEFAULT_HELPERS_RADIUS_KM } : undefined,
      ),
    enabled: !meQuery.isLoading,
  });

  return { meQuery, myLocation, helpersQuery };
}
