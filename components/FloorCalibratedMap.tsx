// components/FloorCalibratedMap.tsx
import { useAssets } from 'expo-asset'; // ⬅️ 추가
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ImageBackground, Platform, Pressable, StyleSheet, Text, View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Polyline } from 'react-native-svg';
import { sendDeleteNode, sendRestoreGraph, sendRestoreNode } from '../config/ws'; // ← components 기준 경로

export type Pt  = { id: string; x: number; y: number };
export type Cal = { x0: number; x1: number; y0: number; y1: number };

type Props = {
  image: any;                 // require('../../assets/images/..png')
  points: Pt[];               // 좌표 배열
  calInit: Cal;               // 보정 초기값
  showDebugBorder?: boolean;  // 표시영역 테두리 보이기 (기본 false)
  current?: [number, number] | null;   // ← 추가 (현재 위치)
  pathNodes?: Array<[number, number]> | null; // ← 추가
  floorKey: 'B1' | '1F' | '4F' | 'B2';   // ✅ 추가
  tabBarPad?: number;
  pathColor?: string;                // ★ 경로 색상
  hazardNodes?: Array<[number, number]>;
};

const DEFAULT_PATH_COLOR = '#2563EB'; // blue-600 정도

export default function FloorCalibratedMap({
  tabBarPad = 0, image, points: initialPts, calInit, floorKey, showDebugBorder = false,
  current = null, pathNodes = null,   pathColor = DEFAULT_PATH_COLOR, hazardNodes = []    // ★ 기본 파란색
}: Props) {
  const insets = useSafeAreaInsets();

  // ⬇️ 여기로 대체: 원본 이미지 크기 로드 (웹/네이티브 공통)
  const [assets] = useAssets([image]);
  const IMG_W = assets?.[0]?.width ?? 1000;  // 로딩 전 임시값(원하면 스피너로 대기해도 OK)
  const IMG_H = assets?.[0]?.height ?? 1000;

  const [points, setPoints] = useState(initialPts);
  const stackRef = useRef<Pt[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [cal, _setCal] = useState(calInit);
  const [step, setStep] = useState(0.5);
  const [locked, setLocked] = useState(false);

  const setCalSafe = useCallback((next: Cal) => {
    let { x0, x1, y0, y1 } = next;
    if (x1 <= x0) x1 = x0 + 0.001;
    if (y1 <= y0) y1 = y0 + 0.001;
    _setCal({ x0, x1, y0, y1 });
  }, []);

  // contain된 실제 표시 영역
  const content = useMemo(() => {
    if (!box.w || !box.h) return { offX: 0, offY: 0, drawW: 0, drawH: 0, scale: 1 };
    const scale = Math.min(box.w / IMG_W, box.h / IMG_H);
    const drawW = IMG_W * scale;
    const drawH = IMG_H * scale;
    const offX = (box.w - drawW) / 2;
    const offY = (box.h - drawH) / 2;
    return { offX, offY, drawW, drawH, scale };
  }, [box, IMG_W, IMG_H]);

  // CAD → 픽셀
  const toPixel = useCallback((p: Pt) => {
    const nx = (p.x - cal.x0) / (cal.x1 - cal.x0);
    const ny = (cal.y1 - p.y) / (cal.y1 - cal.y0); // y 반전
    return {
      left: content.offX + nx * content.drawW,
      top:  content.offY + ny * content.drawH,
    };
  }, [cal, content]);

  // Pt 타입이 { x:number; y:number; ... } 라고 가정
  const toPixelXY = React.useCallback(
    (x: number, y: number) => {
      // 필요하면 소수점 반올림으로 더 선명하게
      const { left, top } = toPixel({ x, y } as any);
      return { left: Math.round(left), top: Math.round(top) };
    },
    [toPixel]
  );
  
  const handlePressPoint = useCallback((id: string) => {
    // 로컬 삭제 + 스택 처리
    setPoints(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx < 0) return prev;
      const removed = prev[idx];
      stackRef.current.push(removed);
      const next = prev.slice();
      next.splice(idx, 1);
      return next;
    });

    // 서버로도 삭제 통지
    sendDeleteNode(floorKey, id); // floorKey는 "B1" | "1F" | "4F" | "B2"
  }, [floorKey, setPoints]);

  const undo = useCallback(() => {
    const last = stackRef.current.pop();
    if (last) setPoints(prev => [...prev, last]);

    // 간단 버전: 서버도 전체 원복(정확히 ‘되돌리기 1회’는 서버쪽에 별도 API 필요)
    // 간단 버전: 서버도 전체 원복(정확히 ‘되돌리기 1회’는 서버쪽에 별도 API 필요)
    if (last) sendRestoreNode(floorKey, last.id);
  }, [floorKey]);

  // 전체복구
  const restoreAll = useCallback(() => {
    stackRef.current.length = 0;
    setPoints(initialPts);
    sendRestoreGraph(floorKey); // 서버 그래프 원복 + 서버가 경로 재계산해 다시 브로드캐스트
  }, [initialPts, floorKey]);

  // 포인트 크기 자동 스케일
    const pointSize = useMemo(
    () => Math.max(5, Math.min(12, content.drawW / 48)),
    [content.drawW]
    );
    const half = pointSize / 2;

  // 보정 조절
  const bump = (key: keyof Cal, delta: number) => {
    if (locked) return;
    setCalSafe({ ...cal, [key]: (cal[key] as number) + delta });
  };

    // 이미 있는 toPixel 이용
  const currentPix = useMemo(() => {
    if (!current) return null;
    const [x, y] = current;
    const { left, top } = toPixel({ id: 'cur', x, y });
    return { left, top };
  }, [current, toPixel]);

  // 경로 Polyline points 문자열
  const polyPoints = useMemo(() => {
    if (!pathNodes || pathNodes.length < 2) return '';
    return pathNodes
      .map(([x, y]) => {
        const { left, top } = toPixel({ id: '', x, y });
        return `${left},${top}`;
      })
      .join(' ');
  }, [pathNodes, toPixel]);

  return (
    <View
      style={styles.container}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        setBox({ w: width, h: height });
      }}
    >
      <ImageBackground source={image} resizeMode="contain" style={{ flex: 1 }}>
        {showDebugBorder && (
          <View
            pointerEvents="none"
            style={{
              position:'absolute',
              left:content.offX, top:content.offY,
              width:content.drawW, height:content.drawH,
              borderWidth:1, borderColor:'rgba(0,150,255,0.5)'
            }}
          />
        )}

        {/* ▼ 파란 경로 (점들보다 뒤에 깔고, 터치 방해 X) */}
        {polyPoints ? (
          <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
            <Polyline
              points={polyPoints}
              stroke={pathColor}
              strokeWidth={3}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </Svg>
        ) : null}

        <View style={styles.canvas}>
          {points.map(p => {
            const { left, top } = toPixel(p);
            return (
              <Pressable
                key={p.id}
                onPress={() => handlePressPoint(p.id)}
                style={[styles.pointWrap, { left, top }]}
                hitSlop={10}
                android_ripple={Platform.OS === 'android' ? { borderless: true } : undefined}
              >
                <View style={{
                  width: pointSize, height: pointSize, borderRadius: half,
                  marginLeft: -half, marginTop: -half,
                  backgroundColor:'rgba(76,175,80,0.9)', borderWidth:1, borderColor:'#2e7d32'
                }}/>
              </Pressable>
            );
          })}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {hazardNodes?.map(([x, y], i) => {
            const { left, top } = toPixelXY(x, y);
            return (
              <View
                key={`hz-${i}`}
                style={{
                  position: 'absolute',
                  left: left - 10,     // 지름 20 기준, 가운데 정렬
                  top:  top - 10,
                  width: 20, height: 20, borderRadius: 10,
                  backgroundColor: '#ef4444',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 12 }}>🔥</Text>
              </View>
            );
          })}
        </View>
        {/* 현재 위치: 빨간 점 */}
        {currentPix && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: currentPix.left,
              top: currentPix.top,
              width: 8,
              height: 8,
              marginLeft: -4,
              marginTop: -4,
              borderRadius: 4,
              backgroundColor: 'red',
              borderWidth: 1,
              borderColor: '#b71c1c',
            }}
          />
        )}
        </View>
      </ImageBackground>
      {/* 하단 툴바: 되돌리기 / 전체복구 */}
      <View style={[
        styles.toolbar,
        { bottom: 40 + insets.bottom + tabBarPad, zIndex: 20 }
      ]}>
        <Pressable style={styles.btn} onPress={undo}>
          <Text style={styles.btnText}>되돌리기</Text>
        </Pressable>
        <Pressable style={styles.btn} onPress={restoreAll}>
          <Text style={styles.btnText}>전체복구</Text>
        </Pressable>
      </View>

      {/* 보정 패널 (preset 제거됨) */}
      {/* <View style={[styles.calPanel, { top: 10 + insets.top, zIndex: 21 }]} pointerEvents="box-none">
        <Text style={styles.calTxt}>
          x0:{cal.x0.toFixed(1)} x1:{cal.x1.toFixed(1)} | y0:{cal.y0.toFixed(1)} y1:{cal.y1.toFixed(1)} · step:{step} · {locked?'🔒':'🔓'}
        </Text>
        <View style={styles.row}>
          <Pressable style={styles.smallBtn} onPress={() => bump('x0', -step)}><Text>-x0</Text></Pressable>
          <Pressable style={styles.smallBtn} onPress={() => bump('x0', +step)}><Text>+x0</Text></Pressable>
          <Pressable style={styles.smallBtn} onPress={() => bump('x1', -step)}><Text>-x1</Text></Pressable>
          <Pressable style={styles.smallBtn} onPress={() => bump('x1', +step)}><Text>+x1</Text></Pressable>
        </View>
        <View style={styles.row}>
          <Pressable style={styles.smallBtn} onPress={() => bump('y0', -step)}><Text>-y0</Text></Pressable>
          <Pressable style={styles.smallBtn} onPress={() => bump('y0', +step)}><Text>+y0</Text></Pressable>
          <Pressable style={styles.smallBtn} onPress={() => bump('y1', -step)}><Text>-y1</Text></Pressable>
          <Pressable style={styles.smallBtn} onPress={() => bump('y1', +step)}><Text>+y1</Text></Pressable>
        </View>
        <View style={styles.row}>
          <Pressable style={styles.smallBtn} onPress={() => setStep(s => Math.max(0.1, +(s-0.1).toFixed(1)))}><Text>step-</Text></Pressable>
          <Pressable style={styles.smallBtn} onPress={() => setStep(s => +(s+0.1).toFixed(1))}><Text>step+</Text></Pressable>
          <Pressable style={[styles.smallBtn, locked && { backgroundColor:'#ddd' }]} onPress={() => setLocked(v=>!v)}>
            <Text>{locked?'unlock':'lock'}</Text>
          </Pressable>
        </View>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#fff' },
  canvas:{ flex:1, position:'relative' },
  pointWrap:{ position:'absolute' },
  toolbar:{ position:'absolute', left:12, flexDirection:'row', gap:8 },
  btn:{ paddingHorizontal:12, paddingVertical:8, backgroundColor:'#111', borderRadius:8 },
  btnText:{ color:'#fff', fontWeight:'600' },
  calPanel:{ position:'absolute', right:8, backgroundColor:'rgba(255,255,255,0.92)', borderRadius:10, padding:8, gap:6 },
  calTxt:{ fontSize:12 },
  row:{ flexDirection:'row', gap:6 },
  smallBtn:{ paddingHorizontal:10, paddingVertical:8, backgroundColor:'#eee', borderRadius:8 },
});