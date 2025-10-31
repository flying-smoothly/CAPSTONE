// app/_appInit.ts (또는 루트 레이아웃에 삽입)
// import Constants from 'expo-constants';
// import * as Notifications from 'expo-notifications';

// export async function getPushTokenAsync() {
//   const { status } = await Notifications.requestPermissionsAsync();
//   if (status !== 'granted') return null;

//   // Expo Go에서도 동작하는 토큰
//   const projectId = Constants.expoConfig?.extra?.eas?.projectId
//                  ?? Constants.easConfig?.projectId;
//   const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
//   return token; // "ExponentPushToken[...]" 형태
// }

// app/src/_appInit.ts
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export async function initApp() {
  try {
    if (Platform.OS === "web") {
      // 웹은 푸시 등록 스킵
      return;
    }
    // 네이티브만 푸시 등록
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;
    await Notifications.getExpoPushTokenAsync({
      projectId: "<당신의-expo-projectId-옵션>", // 없으면 생략 가능
    });
  } catch (e) {
    console.warn("[PushInit] skipped or failed:", e);
  }
}