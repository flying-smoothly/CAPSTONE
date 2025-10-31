// hooks/useBle.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, PermissionsAndroid } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

// ====== 프로젝트 상수 ======
const BEACON_IDS = new Set([2, 3, 5, 6, 7, 8, 9, 10, 11]); // 파이썬에서 쓰던 비콘 번호
const NAME_TO_ID = (name?: string | null) => {
  if (!name) return null;
  const m = name.match(/\d+/);
  if (!m) return null;
  const id = Number(m[0]);
  return BEACON_IDS.has(id) ? id : null;
};

// 실험에서 쓰던 모델: distance = 10 ** ((-86 - rssi)/20)
const rssiToDistance = (rssi: number, rssi0 = -86, nTimes10 = 20) =>
  Math.pow(10, (rssi0 - rssi) / nTimes10);

// ====== 타입 ======
export type BeaconReading = {
  id: number;              // 비콘 번호 (예: 2,3,5,...)
  name: string;            // 기기 이름
  rssi: number;            // 원시 RSSI
  filtered: number;        // EMA 필터 결과
  distance: number;        // 추정 거리(m)
  ts: number;              // 타임스탬프 (ms)
};

export type UseBleOptions = {
  wsUrl?: string;          // 예: "ws://192.168.0.192:8000"
  floor?: string;          // "B2" | "B1" | "1F" | "4F"
  emaAlpha?: number;       // RSSI EMA 알파 (default 0.1)
  emitIntervalMs?: number; // WS 전송 주기 (default 1000ms)
};

// ====== 훅 ======
export function useBle(opts?: UseBleOptions) {
  const {
    wsUrl = "ws://10.101.30.71:8000",
    floor = "B2",
    emaAlpha = 0.1,
    emitIntervalMs = 1000,
  } = opts ?? {};

  const managerRef = useRef(new BleManager());
  const [isScanning, setIsScanning] = useState(false);
  const [ready, setReady] = useState(false);

  // 최신 측정 (id -> 최근 1개)
  const latestRef = useRef<Map<number, BeaconReading>>(new Map());
  const [latestList, setLatestList] = useState<BeaconReading[]>([]);

  // EMA 상태 (id -> filtered)
  const emaRef = useRef<Map<number, number>>(new Map());

  // WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emitTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ===== 권한 요청 (Android 중심) =====
  const requestPermissions = useCallback(async () => {
    if (Platform.OS !== "android") return true;

    const needs = [
      "android.permission.ACCESS_FINE_LOCATION",     // 일부 기기에서 필요한 경우
      "android.permission.BLUETOOTH_SCAN",
      "android.permission.BLUETOOTH_CONNECT",
    ] as const;

    try {
      const results = await PermissionsAndroid.requestMultiple(needs as any);
      const ok = needs.every((k) => results[k] === PermissionsAndroid.RESULTS.GRANTED);
      return ok;
    } catch {
      return false;
    }
  }, []);

  // ===== BLE 매니저 준비 상태 확인 =====
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await requestPermissions();
      if (!ok) {
        console.warn("[BLE] 권한 거부됨");
        return;
      }
      // iOS에선 별도 권한 요청이 없더라도 스캔 전 상태 확인 필요할 수 있음
      // 여기서는 간단히 준비 완료로 둠
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [requestPermissions]);

  // ====== 스캔 콜백 ======
  const onScan = useCallback((error: any, device: Device | null) => {
    if (error) {
      console.warn("[BLE] scan error:", error);
      return;
    }
    if (!device) return;

    // 이름에서 비콘 ID 추출 (CSV 파서 로직과 동일한 규칙)
    const id = NAME_TO_ID(device.name);
    if (id == null) return;

    // 유효한 RSSI만
    const rssi = device.rssi ?? null;
    if (rssi == null || rssi <= -100 || rssi === 127) return;

    // EMA 업데이트
    const prev = emaRef.current.get(id) ?? rssi;
    const filtered = emaAlpha * rssi + (1 - emaAlpha) * prev;
    emaRef.current.set(id, filtered);

    // 거리 추정
    const dist = rssiToDistance(filtered);

    const reading: BeaconReading = {
      id,
      name: device.name ?? `Beacon-${id}`,
      rssi,
      filtered,
      distance: Number(dist.toFixed(3)),
      ts: Date.now(),
    };

    latestRef.current.set(id, reading);
  }, [emaAlpha]);

  // ====== 스캔 시작/정지 ======
  const startScan = useCallback(async () => {
    if (!ready || isScanning) return;
    if (Platform.OS === "web") {
      console.warn("Web에서는 BLE 스캔 불가");
      return;
    }

    // 안드로이드에서는 지정 UUID 필터 없이 콜백에서 필터링
    setIsScanning(true);
    managerRef.current.startDeviceScan(null, { allowDuplicates: true }, onScan);
  }, [ready, isScanning, onScan]);

  const stopScan = useCallback(() => {
    managerRef.current.stopDeviceScan();
    setIsScanning(false);
  }, []);

  // ====== WS 연결 & 주기 전송 ======
  const ensureWs = useCallback(() => {
    if (wsRef.current || !wsUrl) return;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        // 주기 전송 시작
        if (!emitTimer.current) {
          emitTimer.current = setInterval(() => {
            const arr = Array.from(latestRef.current.values());
            setLatestList(arr); // UI 노출용 상태 업데이트

            // 파이썬 쪽에서 기대하는 형태에 맞춰 전송
            // 여기선 단순히 RSSI/거리 목록을 보냄 (경로 계산은 파이썬에서)
            const payload = {
              kind: "rssi_batch",
              floor,
              readings: arr.map((r) => ({
                id: r.id,
                name: r.name,
                rssi: r.rssi,
                filtered: Number(r.filtered.toFixed(1)),
                distance: r.distance,
                ts: r.ts,
              })),
            };
            try {
              ws.send(JSON.stringify(payload));
            } catch (e) {
              console.warn("[WS] send error", e);
            }
          }, emitIntervalMs);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        wsRef.current = null;
        if (emitTimer.current) {
          clearInterval(emitTimer.current);
          emitTimer.current = null;
        }
        // 재연결
        if (!reconnectTimer.current) {
          reconnectTimer.current = setTimeout(() => {
            reconnectTimer.current = null;
            ensureWs();
          }, 1500);
        }
      };

      ws.onerror = () => {
        // close에서 재연결 처리
      };
    } catch (e) {
      console.warn("[WS] connect error", e);
    }
  }, [wsUrl, floor, emitIntervalMs]);

  const closeWs = useCallback(() => {
    if (emitTimer.current) {
      clearInterval(emitTimer.current);
      emitTimer.current = null;
    }
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }
    setWsConnected(false);
  }, []);

  // 컴포넌트 생애주기
  useEffect(() => {
    ensureWs();
    return () => {
      stopScan();
      closeWs();
      managerRef.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensureWs]);

  // 공개 API
  return useMemo(
    () => ({
      // state
      ready,
      isScanning,
      wsConnected,
      latestList,

      // actions
      startScan,
      stopScan,
      reconnectWs: () => { closeWs(); ensureWs(); },
    }),
    [ready, isScanning, wsConnected, latestList, startScan, stopScan, closeWs, ensureWs],
  );
}