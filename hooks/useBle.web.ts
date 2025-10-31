// hooks/useBle.web.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** 한 개 비콘 측정치 타입 */
export type BeaconReading = {
  id: number;
  name: string;
  rssi: number;
  filtered: number;
  distance: number;
  ts: number;
};

export type UseBleOptions = {
  /** WebSocket 서버 주소 (예: ws://192.168.0.10:8000) */
  wsUrl?: string;
  /** 층 키(옵션, 서버로 보낼 일 없으면 무시 가능) */
  floor?: string;
  /** (옵션) 서버 배치 주기와 무관, 로컬 타이머 안 씀 */
  emitIntervalMs?: number;
};

/**
 * 웹 전용 훅: 로컬 BLE 스캔은 못하고,
 * Pi 에이전트 ↔ 서버가 푸시하는 데이터/상태를 WS로 받아 화면에 반영.
 */
export function useBle(opts?: UseBleOptions) {
  const { wsUrl } = opts ?? {};

  // 웹은 로컬 BLE 불가 → ready / isScanning 은 의미상 false 고정
  const [ready] = useState(false);

  // Pi 에이전트 스캔 상태
  const [agentScanning, setAgentScanning] = useState(false);

  // 최신 측정 리스트(서버/에이전트가 보내주는 것을 그대로 반영)
  const [latestList, setLatestList] = useState<BeaconReading[]>([]);

  // WS 연결 상태
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** WS 열기 (자동 재연결 포함) */
  const openWs = useCallback(() => {
    if (!wsUrl) return;

    // 이미 연결중/연결된 경우 스킵
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      // 🔸 연결 직후 에이전트 상태 질의
      try { ws.send(JSON.stringify({ kind: "agent_state?" })); } catch {}
    };

    ws.onclose = () => {
      setWsConnected(false);
      // 2초 후 재접속
      if (!retryTimer.current) {
        retryTimer.current = setTimeout(() => {
          retryTimer.current = null;
          openWs();
        }, 2000);
      }
    };

    ws.onerror = () => {
      // 에러는 onclose에서 재연결 처리
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(String(e.data));

        // 🔸 에이전트 스캔 상태 반영
        if (msg?.kind === "agent_state") {
          setAgentScanning(!!msg.scanning);
          return;
        }

        // 🔸 에이전트가 직접 브로드캐스트한 1초 배치
        if (msg?.kind === "rssi_batch" && Array.isArray(msg.readings)) {
          const list: BeaconReading[] = msg.readings.map((r: any) => ({
            id: r.id, name: r.name ?? `Beacon-${r.id}`,
            rssi: r.rssi, filtered: r.filtered, distance: r.distance,
            ts: r.ts ?? Date.now(),
          }));
          setLatestList(list);
          return;
        }
        if (msg?.kind === "live_update") {    // 서버가 보내는 계산 결과
          const batches = msg?.debug?.recent_batches;

          // 최근 윈도(최근 3초 내 측정치)가 존재하면 마지막 배치를 표시용으로 변환
          if (Array.isArray(batches) && batches.length) {
            const last = batches[batches.length - 1]; // 마지막 배치 선택
            const list: BeaconReading[] = (last.readings ?? []).map((r: any) => ({
              id: r.id,
              name: r.name ?? `Beacon-${r.id}`,
              rssi: r.rssi,
              filtered: r.filtered,
              distance: r.distance,
              ts: r.ts ?? Date.now(),
            }));
            setLatestList(list);
          }

          return; // 처리 후 종료
        }

        // 🔸 서버 live_update의 recent_batches
        const batches = msg?.debug?.recent_batches;
        if (Array.isArray(batches) && batches.length) {
          const last = batches[batches.length - 1];
          const list: BeaconReading[] = (last.readings ?? []).map((r: any) => ({
            id: r.id, name: r.name ?? `Beacon-${r.id}`,
            rssi: r.rssi, filtered: r.filtered, distance: r.distance,
            ts: r.ts ?? Date.now(),
          }));
          setLatestList(list);
        }
      } catch {}
    };
  }, [wsUrl]);

  const closeWs = useCallback(() => {
    if (retryTimer.current) { clearTimeout(retryTimer.current); retryTimer.current = null; }
    const ws = wsRef.current; wsRef.current = null;
    try { ws?.close(); } catch {}
    setWsConnected(false);
  }, []);

  useEffect(() => { openWs(); return () => closeWs(); }, [openWs, closeWs]);

  const startScan = useCallback(() => {
    try { wsRef.current?.send(JSON.stringify({ kind: "start_scan" })); } catch {}
  }, []);
  const stopScan = useCallback(() => {
    try { wsRef.current?.send(JSON.stringify({ kind: "stop_scan" })); } catch {}
  }, []);
  const reconnectWs = useCallback(() => { closeWs(); setTimeout(openWs, 10); }, [closeWs, openWs]);

  // 🔸 isScanning을 agentScanning으로 내보냄
  return useMemo(() => ({
    ready,
    isScanning: agentScanning,
    wsConnected,
    latestList,
    startScan,
    stopScan,
    reconnectWs,
  }), [ready, agentScanning, wsConnected, latestList, startScan, stopScan, reconnectWs]);
}