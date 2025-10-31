// src/ws/index.ts
type Listener = (msg: any) => void;

export const WS_URL = 'ws://10.101.30.71:8000';
let ws: WebSocket | null = null;
const listeners = new Set<Listener>();

export function ensureWS() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return ws;
  ws = new WebSocket(WS_URL);
  ws.onopen = () => console.log('[WS] opened');
  ws.onmessage = (e) => {
    try { const msg = JSON.parse(String(e.data)); listeners.forEach(l => l(msg)); }
    catch (err) { console.warn('[WS] bad message', err); }
  };
  ws.onerror = (err) => console.warn('[WS] error', err);
  ws.onclose = () => console.log('[WS] closed');
  return ws;
}

export function wsOnMessage(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
