import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

export async function getPushTokenAsync() {
  // ① 웹 환경 보호
  if (Platform.OS === 'web') {
    const canUseWebPush =
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator;
    if (!canUseWebPush) return null;
  }

  // ② 권한 요청
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  // ③ EAS/Expo 자동 projectId 탐색
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  // ④ Expo 토큰 요청
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}
