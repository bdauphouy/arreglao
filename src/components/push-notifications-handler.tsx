import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useRegisterPushNotifications } from '../hooks/use-register-push-notifications';
import { routeForPushData } from '../lib/push-notifications';

// Mounted once in app/_layout.tsx. Registers the device's push token and
// handles both cold-start (app opened by tapping a notification while fully
// closed) and warm/background taps with the same routing logic.
export function PushNotificationsHandler(): null {
  useRegisterPushNotifications();
  const router = useRouter();

  useEffect(() => {
    function handleResponse(response: Notifications.NotificationResponse) {
      const route = routeForPushData(
        response.notification.request.content.data as Record<string, unknown>,
      );
      if (!route) {
        return;
      }
      if (route.screen === 'annonce') {
        router.push(`/annonces/${route.id}`);
      } else {
        router.push(`/messages/${route.id}`);
      }
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleResponse(response);
      }
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => subscription.remove();
  }, [router]);

  return null;
}
