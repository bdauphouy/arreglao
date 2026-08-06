import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { registerPushToken } from '../api/profiles';
import { useCurrentProfile } from './use-current-profile';

export function useRegisterPushNotifications(): void {
  const { data: profile } = useCurrentProfile();
  const profileId = profile?.id;

  useEffect(() => {
    if (!profileId) {
      return;
    }

    let cancelled = false;

    async function register() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      let { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        ({ status } = await Notifications.requestPermissionsAsync());
      }
      if (status !== 'granted' || cancelled) {
        return;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
      if (!cancelled && profileId) {
        await registerPushToken(profileId, token);
      }
    }

    register().catch((error) => console.warn('Push notification registration failed', error));

    return () => {
      cancelled = true;
    };
  }, [profileId]);
}
