// app/(tabs)/F1.tsx
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FireBanner, { BANNER_HEIGHT } from '../../components/FireBanner';
import FloorCalibratedMap from '../../components/FloorCalibratedMap';
import ImageOverlay from '../../components/ImageOverlay'; // ← 추가
import SafetyOverlay from '../../components/SafetyOverlay';
import { WS_URL } from '../../config/ws';
import { toPts } from '../../utils/_points';

const IMG = require('../../assets/images/F1(문자X, 아이콘 삽입).png');
const APP_GUIDE_SRC = require('../../assets/images/app_guide.png'); // ← 앱 사용 안내 이미지

const raw: [number,number][] = [
  [2,1], [4,5], [4,9], [4,13], [6,-3], [6,1], [10,1], [14,1], [18,1],
];
const POINTS = toPts(raw);
const CAL_INIT = { x0: -21.5, x1: 61.0, y0: -35.5, y1: 45.0 };

// 안내 이미지 경로(문자열/require 모두 가능)
// 화재시 대피방법
const FIRE_ESCAPE_IMG = require('../../assets/images/fire_escape.jpg');
// 소화기 사용방법
const EXTINGUISHER_IMG = require('../../assets/images/fire_use.jpg');

type FireAlertMsg = {
  kind: 'fire_alert';
  floor: string;
  confidence: number;
  ts?: string;
  image?: string; // 서버가 Base64 이미지를 줄 수도 있음 (옵션)
};

export default function F1Screen() {
  const insets = useSafeAreaInsets();
  const [showBanner, setShowBanner] = useState(false);
  const bannerText = '🔥 화재 감지(F1)';
  const topPad = (showBanner ? (insets.top + 8 + BANNER_HEIGHT + 8) : insets.top);

  const pad = useBottomTabBarHeight();        // 훅은 이렇게 호출
  const [showSafety, setShowSafety] = useState(false);
  const [showAppGuide, setShowAppGuide] = useState(false);          // ← 상태 추가
  const [current, setCurrent] = useState<[number, number] | null>(null);
  const [pathNodes, setPathNodes] = useState<Array<[number, number]>>([]);

  // 화재 알림 상태
  const [fireAlert, setFireAlert] = useState<FireAlertMsg | null>(null);
  const lastFireMsRef = useRef(0);
  const COOLDOWN_MS = 3000; // 너무 자주 뜨는 것 방지

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => console.log('[WS F1] connected');
    ws.onmessage = (e) => {
      // 모든 메시지 공통 로그
      console.log('[WS F1] msg:', e.data);
      let msg: any;
      try {
        msg = JSON.parse(String(e.data));
      } catch {
        return;
      }

      // 1) 위치/경로 업데이트(이전과 동일)
      if (String(msg.floor || '').toUpperCase() === 'F1') {
        const snap = Array.isArray(msg.snapped_list) ? msg.snapped_list : [];
        if (snap.length && Array.isArray(snap[0]) && snap[0].length === 2) {
          setCurrent([Number(snap[0][0]), Number(snap[0][1])]);
        }
        if (Array.isArray(msg.best_path)) {
          const cleaned: Array<[number, number]> = msg.best_path
            .filter((p: any) => Array.isArray(p) && p.length === 2)
            .map((p: any) => [Number(p[0]), Number(p[1])] as [number, number]);
          setPathNodes(cleaned);
        }
      }

      // 2) 🔥 화재 알림 받기
      if (msg?.kind === 'fire_alert' && String(msg.floor || '').toUpperCase() === 'F1') {
        const now = Date.now();
        if (now - lastFireMsRef.current < COOLDOWN_MS) return; // 쏟아질 때 디바운스
        lastFireMsRef.current = now;

        const alertMsg: FireAlertMsg = {
          kind: 'fire_alert',
          floor: 'F1',
          confidence: Number(msg.confidence ?? 0),
          ts: msg.ts,
          image: typeof msg.image === 'string' ? msg.image : undefined,
        };
        setFireAlert(alertMsg);

        // 진동/알림(선택)
        try { Vibration.vibrate(500); } catch {}

        // 모달(안내창) 자동 오픈
        setShowSafety(true);

        // 간단 경고창도 함께(원하면 주석)
        if (Platform.OS !== 'web') {
          Alert.alert('화재 감지', `층: F1\n신뢰도: ${alertMsg.confidence.toFixed(2)}`);
        }
      }
    };
    ws.onclose = () => console.log('[WS F1] closed');
    ws.onerror = (err) => console.warn('[WS F1] error', err);
    return () => ws.close();
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      {/* 배너는 absolute이므로 부모 위에 떠 있지만, paddingTop으로 본문은 아래로 내려감 */}
      <FireBanner
        visible={showBanner}
        text={bannerText}
        onPressGuide={() => {/* 안내 모달 열기 */}}
        onClose={() => setShowBanner(false)}
      />
      <FloorCalibratedMap
        image={IMG}
        points={POINTS}
        calInit={CAL_INIT}
        current={current}
        pathNodes={pathNodes}
        floorKey="1F"
        tabBarPad={pad}
        pathColor="#2563EB"   // 파란색 경로
      />
    
      {/* 상단 배너 (화재 감지 시) */}
      {fireAlert && (
        <View style={styles.banner}>
          <Text style={styles.bannerTxt}>
            🔥 화재 감지(F1) conf={fireAlert.confidence.toFixed(2)}
          </Text>
          <Pressable onPress={() => setShowSafety(true)} style={styles.bannerBtn}>
            <Text style={styles.bannerBtnTxt}>안내 보기</Text>
          </Pressable>
          <Pressable onPress={() => setFireAlert(null)} style={styles.bannerClose}>
            <Text style={styles.bannerBtnTxt}>닫기</Text>
          </Pressable>
        </View>
      )}

      {/* 하단 오른쪽 버튼 두 개 나란히 */}
      <View 
      style={[styles.fabRow, { bottom: 24 + (pad ?? 0) }]}>
        <Pressable style={styles.fabPrimary} onPress={() => setShowSafety(true)}>
          <Text style={styles.fabText}>화재 대피 안내</Text>
        </Pressable>
        <Pressable style={styles.fabSecondary} onPress={() => setShowAppGuide(true)}>
          <Text style={styles.fabText}>앱 사용 안내</Text>
        </Pressable>
      </View>

      <SafetyOverlay
        visible={showSafety}
        onClose={() => setShowSafety(false)}
        manualSrc={FIRE_ESCAPE_IMG}       // 화재시 대피방법
        extinguisherSrc={EXTINGUISHER_IMG} // 소화기 사용방법
      />
      {/* 새 “앱 사용 안내” 단일 이미지 모달 */}
      <ImageOverlay
        visible={showAppGuide}
        onClose={() => setShowAppGuide(false)}
        src={APP_GUIDE_SRC}           // ← 여기에 URL 문자열도 가능
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fabRow: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  fabPrimary: {
    backgroundColor: '#2563eb',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
  },
  fabSecondary: {
    backgroundColor: '#10b981',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
  },
  fabText: { color: '#fff', fontWeight: '700' },

  banner: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: '#b91c1c',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerTxt: { color: 'white', fontWeight: '700', flex: 1 },
  bannerBtn: {
    paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#111827', borderRadius: 8,
  },
  bannerBtnTxt: { color: 'white', fontWeight: '700' },
  bannerClose: {
    paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#374151', borderRadius: 8,
  },
  screen: { flex: 1, backgroundColor: '#fff' },
});