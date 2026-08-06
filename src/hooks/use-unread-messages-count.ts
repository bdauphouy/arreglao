import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { countUnreadMessages, subscribeToMessageChanges } from '../api/conversations';
import { useCurrentProfile } from './use-current-profile';

export function useUnreadMessagesCount() {
  const meQuery = useCurrentProfile();
  const meId = meQuery.data?.id;
  const queryClient = useQueryClient();

  const countQuery = useQuery({
    queryKey: ['messages', 'unread-count', meId],
    queryFn: () => countUnreadMessages(meId!),
    enabled: !!meId,
  });

  useEffect(() => {
    if (!meId) {
      return;
    }
    const channel = subscribeToMessageChanges(() => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count', meId] });
    });
    return () => {
      channel.unsubscribe();
    };
  }, [meId, queryClient]);

  return countQuery.data ?? 0;
}
