import { useQuery } from '@tanstack/react-query';

import { getCurrentUserId } from '../api/auth';
import { getProfile } from '../api/profiles';

export function useCurrentProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const userId = await getCurrentUserId();
      return userId ? getProfile(userId) : null;
    },
  });
}
