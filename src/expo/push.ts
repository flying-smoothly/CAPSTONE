// src/expo/push.ts
import * as Notifications from 'expo-notifications';

export async function getPushTokenAsync() {
  // Expo Go 제약 회피: 필요 시 null 리턴
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  // Dev Build에서 프로젝트 ID 지정 권장
  // const projectId = 'YOUR_EAS_PROJECT_ID';
  // const token = await Notifications.getExpoPushTokenAsync({ projectId });
  // return token.data;

  return null; // Expo Go에서는 일단 mock
}
