# pi_ble_agent.py
import asyncio, json, time, re
from typing import Dict, Optional
import websockets
from bleak import BleakScanner
from bleak.backends.scanner import AdvertisementData  # 👈 광고 데이터 타입

SERVER_WS = "ws://10.101.30.71:8000"
FLOOR = "B2"
EMA_ALPHA = 0.1
EMIT_INTERVAL = 2.0

VALID_IDS = {2,3,5,6,7,8,9,10,11}
ID_RE = re.compile(r"\d+")

latest: Dict[int, dict] = {}

ema: Dict[int, float] = {}
scanning: bool = False
scanner: Optional[BleakScanner] = None

def name_to_id(name: Optional[str]) -> Optional[int]:
    if not name:
        return None
    m = ID_RE.search(name)
    if not m:
        return None
    i = int(m.group(0))
    return i if i in VALID_IDS else None

def extract_id_from_names(name1: Optional[str], name2: Optional[str]) -> Optional[int]:
    # device.name 또는 advertisement_data.local_name 둘 다 시도
    for nm in (name1, name2):
        if not nm:
            continue
        m = ID_RE.search(nm)
        if m:
            i = int(m.group(0))
            if i in VALID_IDS:
                return i
    return None

def rssi_to_distance(rssi: float, rssi0=-86, n10=20):
    return 10 ** ((rssi0 - rssi) / n10)

async def send_state(ws, value: bool):
    try:
        await ws.send(json.dumps({"kind": "agent_state", "scanning": bool(value)}))
    except Exception as e:
        print("[AGENT] send_state error:", e)

async def scan_loop():
    """Bleak 콜백 기반 스캔 루프 (Windows 호환: adv.rssi/local_name 사용)"""
    global scanner, scanning

    def on_detect(device, adv: AdvertisementData):
        try:
            # ✅ RSSI는 무조건 adv.rssi 를 사용 (BLEDevice에는 rssi 없음)
            rssi = getattr(adv, "rssi", None)
            if rssi is None or rssi <= -100 or rssi == 127:
                return

            bid = extract_id_from_names(getattr(device, "name", None),
                                        getattr(adv, "local_name", None))
            if bid is None:
                return

            prev = ema.get(bid, rssi)
            filt = EMA_ALPHA * rssi + (1 - EMA_ALPHA) * prev
            ema[bid] = filt

            now_ms = int(time.time() * 1000)
            latest[bid] = {
                "id": bid,
                "name": (adv.local_name or getattr(device, "name", None) or f"Beacon-{bid}"),
                "rssi": rssi,
                "filtered": round(filt, 1),
                "distance": round(rssi_to_distance(filt), 3),
                "ts": now_ms,
            }
        except Exception as e:
            print("[AGENT] on_detect error:", e)

    scanner = BleakScanner(detection_callback=on_detect)
    await scanner.start()
    try:
        while scanning:
            await asyncio.sleep(0.2)
    except asyncio.CancelledError:
        # 태스크 취소 시 조용히 종료
        pass
    finally:
        try:
            await scanner.stop()
        except:
            pass
        scanner = None

async def ws_client():
    global scanning
    emit_ts = 0.0
    scan_task: Optional[asyncio.Task] = None

    while True:
        try:
            async with websockets.connect(SERVER_WS, ping_interval=20, ping_timeout=20) as ws:
                print("[AGENT] connected to server")
                # 접속 직후 현재 상태 1회 통지
                await send_state(ws, scanning)

                while True:
                    # 주기 배치 전송
                    now = time.time()
                    if now - emit_ts >= EMIT_INTERVAL:
                        try:
                            await ws.send(json.dumps({
                                "kind": "rssi_batch",
                                "floor": FLOOR,
                                "readings": list(latest.values())
                            }, ensure_ascii=False))
                        except Exception as e:
                            print("[AGENT] send error:", e)
                        emit_ts = now

                    # 서버 명령 수신 (non-blocking)
                    try:
                        msg_text = await asyncio.wait_for(ws.recv(), timeout=0.05)
                    except asyncio.TimeoutError:
                        continue

                    try:
                        msg = json.loads(msg_text)
                    except:
                        msg = {}

                    k = msg.get("kind")
                    if k == "start_scan" and not scanning:
                        print("[AGENT] start_scan")
                        scanning = True
                        await send_state(ws, True)
                        # 이전 태스크 종료
                        if scan_task and not scan_task.done():
                            scan_task.cancel()
                            try:
                                await scan_task
                            except:
                                pass
                        scan_task = asyncio.create_task(scan_loop())

                    elif k == "stop_scan" and scanning:
                        print("[AGENT] stop_scan")
                        scanning = False
                        await send_state(ws, False)
                        if scan_task:
                            scan_task.cancel()
                            try:
                                await scan_task
                            except:
                                pass
                            scan_task = None

        except Exception as e:
            print("[AGENT] ws error, reconnecting in 2s:", e)
            # 연결이 끊겼으면 스캔 태스크/플래그도 정리
            if scan_task and not scan_task.done():
                scan_task.cancel()
                try:
                    await scan_task
                except:
                    pass
            scan_task = None
            scanning = False
            await asyncio.sleep(2.0)

async def main():
    await ws_client()

if __name__ == "__main__":
    asyncio.run(main())
