// config/ws.ts
import Constants from 'expo-constants';

function getHostFromExpo(): string {
  // SDK 50+: expoConfig.hostUri, 예: "192.168.0.3:8081"
  const hostUri =
    // @ts-ignore
    Constants.expoConfig?.hostUri ||
    // SDK 49/older fallback
    // @ts-ignore
    Constants.manifest2?.extra?.expoGo?.developer?.host ||
    '';
  const host = hostUri.split(':')[0];
  return host || '10.101.30.56'; // 최후의 fallback
}


function pickHost(): string {
  // 브라우저에서 열린 호스트를 그대로 사용 (예: 127.0.0.1, 또는 10.101.30.56)
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }
  return '10.101.30.56'; // 최후 fallback
}

export function sendStartScan() { wsSend({ kind: 'start_scan' }); }
export function sendStopScan()  { wsSend({ kind: 'stop_scan'  }); }

export const WS_PORT = 8000;
export const WS_URL = `ws://${pickHost()}:${WS_PORT}`;    // ✅ 자동

//export const WS_URL = `ws://${getHostFromExpo()}:${WS_PORT}`;
//export const WS_URL = 'ws://10.101.30.56:8000';

type Msg = any;

let ws: WebSocket | null = null;
let isOpen = false;
const queue: string[] = [];
const listeners: Array<(msg: Msg) => void> = [];

function setHandlers(sock: WebSocket) {
  sock.onopen = () => {
    isOpen = true;
    // 대기열 비우기
    while (queue.length) {
      const t = queue.shift()!;
      try { sock.send(t); } catch {}
    }
    console.log('[WS] opened:', WS_URL);
  };

  sock.onmessage = (e) => {
    try {
      const msg = JSON.parse(String(e.data));
      listeners.forEach(fn => fn(msg));
    } catch {
      // 텍스트 그대로 전달이 필요한 경우
      listeners.forEach(fn => fn(e.data));
    }
  };

  sock.onclose = () => {
    isOpen = false;
    console.log('[WS] closed, retrying in 2s');
    setTimeout(() => {
      // 자동 재연결
      try { ensureWS(); } catch {}
    }, 2000);
  };

  sock.onerror = (e) => {
    console.warn('[WS] error', e);
  };
}

export function ensureWS(): WebSocket {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return ws;
  }
  ws = new WebSocket(WS_URL);
  setHandlers(ws);
  return ws;
}

// 공용 메시지 수신 구독
export function wsOnMessage(fn: (msg: Msg) => void) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

// JSON 안전 발송
export function wsSend(obj: any) {
  const text = typeof obj === 'string' ? obj : JSON.stringify(obj);
  const sock = ensureWS();
  if (isOpen && sock.readyState === WebSocket.OPEN) {
    sock.send(text);
  } else {
    queue.push(text);
  }
}

// 앱에서 쓰기 편한 헬퍼들
export function sendDeleteNode(floor: string, nodeId: string) {
  // nodeId는 "(6,1)" 같은 문자열로 보냈죠
  wsSend({ kind: 'delete_node', floor, node: nodeId });
}

export function sendRestoreGraph(floor: string) {
  wsSend({ kind: 'restore_graph', floor });
}

export function sendRecompute(floor: string, snapped?: [number, number] | null) {
  wsSend({ kind: 'recompute', floor, snapped });
}
