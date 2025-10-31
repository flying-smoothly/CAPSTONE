import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState} from 'react';
import { ensureWS, WS_URL, wsOnMessage } from '../../config/ws';
// 예: app/(tabs)/_layout.tsx 또는 각 층 화면 공통 훅
import * as Notifications from 'expo-notifications';
import { getPushTokenAsync } from '../src/_appInit';

const [showSafety, setShowSafety] = useState(false);

useEffect(() => {
  let ws: WebSocket | null = null;

  (async () => {
    const token = await getPushTokenAsync();
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('[WS] opened');
      if (token) {
        ws!.send(JSON.stringify({ kind: 'register_push_token', token }));
      }
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(String(e.data));

        if (msg.kind === 'fire_detected') {
          // ① 즉시 로컬 알림(앱이 포그라운드여도 배너/알림)
          Notifications.scheduleNotificationAsync({
            content: {
              title: '🔥 화재 감지',
              body: `신뢰도 ${msg.conf}`,
              data: msg,
            },
            trigger: null,
          });

          // ② 화면 내 오버레이/팝업도 띄우기(당신이 만든 SafetyOverlay 재사용)
          setShowSafety(true);
        }
      } catch {}
    };

    ws.onerror = (err) => console.warn('[WS] error', err);
    ws.onclose = () => console.log('[WS] closed');
  })();

  return () => { ws?.close(); };
}, []);

export default function TabLayout() {
  const router = useRouter();
  const lastFloorRef = useRef<string | null>(null);

  useEffect(() => {
    // 소켓 연결 보장
    ensureWS();
    console.log('[WS root] ensure connect:', WS_URL);

    const off = wsOnMessage((msg) => {
      try {
        const floor = String(msg?.floor || '').toUpperCase();
        const PATH_BY_FLOOR = {
          B2: '/(tabs)/b2',
          B1: '/(tabs)/b1',
          '1F': '/(tabs)/f1',
          '4F': '/(tabs)/f4',
        } as const;

        type FloorKey = keyof typeof PATH_BY_FLOOR;
        type AppPath  = (typeof PATH_BY_FLOOR)[FloorKey];

        // 예: floor 값이 서버/WS에서 옴
        const path = PATH_BY_FLOOR[floor as FloorKey]; // path는 AppPath로 추론됨

        if (path && lastFloorRef.current !== floor) {
          lastFloorRef.current = floor;
          router.push(path); // 타입 에러 해결
        }
      } catch {}
    });
    console.log('[WS root] ensure connect:', WS_URL);

    return off;
  }, [router]);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="b2" options={{ title: 'B2',
        tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />      
      <Tabs.Screen name="b1" options={{ title: 'B1',
        tabBarIcon: ({ color, size }) => <Ionicons name="layers-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="f1" options={{ title: 'F1',
        tabBarIcon: ({ color, size }) => <Ionicons name="navigate-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="f4" options={{ title: 'F4',
        tabBarIcon: ({ color, size }) => <Ionicons name="navigate-circle-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
