# server.py
import asyncio, json, time
from typing import List, Dict, Any, Tuple
from collections import deque
import websockets

from final import (beacon_coords, trilaterate_from_top3, compute_best_path, classify_area)

HOST = "0.0.0.0"
PORT = 8000
EMIT_INTERVAL = 2.0

clients = set()

async def broadcast(obj: dict):
    if not clients:
        return
    text = json.dumps(obj, ensure_ascii=False)
    await asyncio.gather(*[c.send(text) for c in list(clients)], return_exceptions=True)

def compress_batch_for_log(batch: Dict[str, Any]) -> list:
    out = []
    for r in batch.get("readings", []):
        val = r.get("filtered", r.get("rssi"))
        try:
            v = None if val is None else round(float(val), 1)
        except Exception:
            v = None
        out.append((r.get("id"), v))
    return out


def aggregate_window(window: deque) -> Dict[int, Dict[str, float]]:
    """
    최근 3초 window에서 비콘별 평균값 계산.
    - avg_filtered: filtered 평균 (없으면 None)
    - avg_rssi    : rssi 평균 (없으면 None)
    - count       : 등장 횟수
    """
    acc: Dict[int, Dict[str, float]] = {}
    for b in window:
        for r in b.get("readings", []):
            bid = r.get("id")
            if bid not in beacon_coords:
                continue
            fil = r.get("filtered")
            raw = r.get("rssi")
            # 드랍값 제외
            try:
                if fil is not None and float(fil) <= -100:
                    fil = None
            except Exception:
                fil = None
            try:
                if raw is not None and float(raw) <= -100:
                    raw = None
            except Exception:
                raw = None

            if bid not in acc:
                acc[bid] = {"sum_fil": 0.0, "cnt_fil": 0, "sum_raw": 0.0, "cnt_raw": 0}

            if fil is not None:
                acc[bid]["sum_fil"] += float(fil)
                acc[bid]["cnt_fil"] += 1
            if raw is not None:
                acc[bid]["sum_raw"] += float(raw)
                acc[bid]["cnt_raw"] += 1

    # 평균 계산
    out: Dict[int, Dict[str, float]] = {}
    for bid, d in acc.items():
        avg_fil = d["sum_fil"] / d["cnt_fil"] if d["cnt_fil"] > 0 else None
        avg_raw = d["sum_raw"] / d["cnt_raw"] if d["cnt_raw"] > 0 else None
        cnt = max(d["cnt_fil"], d["cnt_raw"])
        out[bid] = {"avg_filtered": avg_fil, "avg_rssi": avg_raw, "count": cnt}
    return out


def pick_top3_by_window_avg(window: deque) -> List[Dict[str, Any]]:
    """
    최근 3초 window의 평균으로 Top3 선택.
    기준: avg_filtered 우선, 없으면 avg_rssi.
    반환 항목 예:
      {"id": 10, "filtered": -72.3, "rssi": -74.1, "distance": None, "count": 3}
    """
    stats = aggregate_window(window)

    def metric(item: Tuple[int, Dict[str, float]]) -> float:
        bid, d = item
        v = d.get("avg_filtered")
        if v is None:
            v = d.get("avg_rssi", -9999)
        return float(v)

    # 유효값만 (metric > -100) 남기고 정렬
    items = []
    for bid, d in stats.items():
        m = d["avg_filtered"] if d["avg_filtered"] is not None else d["avg_rssi"]
        if m is None:
            continue
        try:
            if float(m) <= -100:
                continue
        except Exception:
            continue
        items.append((bid, d))

    items.sort(key=metric, reverse=True)
    top = items[:3]

    top3: List[Dict[str, Any]] = []
    for bid, d in top:
        top3.append({
            "id": bid,
            "filtered": None if d["avg_filtered"] is None else float(d["avg_filtered"]),
            "rssi": None if d["avg_rssi"] is None else float(d["avg_rssi"]),
            "distance": None,  # 평균 RSSI/filtered로 거리 환산은 final.trilaterate_from_top3에 맡김
            "count": int(d["count"]),
        })
    return top3


async def handle(ws):
    clients.add(ws)

    ra = ws.remote_address
    peer = f"{ra[0]}:{ra[1]}" if isinstance(ra, tuple) and len(ra) >= 2 else str(ra)

    # 연결별 상태
    window = deque(maxlen=3)
    last_emit_ts = 0.0
    last_floor = "B2"

    try:
        async for text in ws:
            try:
                msg = json.loads(text)
            except Exception:
                continue

            kind = msg.get("kind")

            # 1) 컨트롤/상태 메시지 → 그대로 전 클라이언트 브로드캐스트
            if kind in ("start_scan", "stop_scan", "agent_state"):
                await broadcast(msg)
                continue

            # 2) 배치 수신
            if kind == "rssi_batch":
                floor = msg.get("floor", last_floor)
                last_floor = floor
                readings = msg.get("readings", [])
                window.append({"ts": time.time(), "readings": readings})

                # ★ 추가: 받은 배치를 즉시 브로드캐스트하여 UI가 바로 갱신되도록
                try:
                    await asyncio.gather(
                        *[c.send(json.dumps(msg, ensure_ascii=False)) for c in list(clients)]
                    )
                except Exception as e:
                    print("[WS] broadcast rssi_batch error:", e)

                # 3) 3초마다 계산/브로드캐스트
                now = time.time()
                if now - last_emit_ts < EMIT_INTERVAL:
                    continue

                top3 = pick_top3_by_window_avg(window)
                if len(top3) < 3:
                    last_emit_ts = now
                    continue

                try:
                    x, y, method = trilaterate_from_top3(top3, use_filtered=True)
                except Exception:
                    last_emit_ts = now
                    continue

                try:
                    area = classify_area((x, y), floor, strict=False)
                except Exception:
                    area = None

                try:
                    start_node, best_path = compute_best_path(floor, x, y)
                except Exception:
                    last_emit_ts = now
                    continue

                payload = {
                    "kind": "live_update",                 # ★ kind 명시 (웹에서 구분 용이)
                    "floor": floor,
                    "snapped_list": [list(start_node)],
                    "best_path": [list(pt) for pt in best_path],
                    "method": method,
                    "area": area,
                    "emit_interval_sec": EMIT_INTERVAL,
                    "debug": {
                        "top3": top3,
                        "tag_xy": [x, y],
                        "recent_batches": list(window),
                    },
                }
                await broadcast(payload)
                last_emit_ts = now
                continue

            # # 6) 로그 (최근 3초 배치 + 평균 Top3 표시)
            # window_log = [compress_batch_for_log(b) for b in list(window)]
            # top3_log = [(t["id"], round(t.get("filtered", t.get("rssi", -999)), 2), t["count"]) for t in top3]
            # print(f"[Tri] floor={floor}, method={method}, TAG=({x:.2f}, {y:.2f}) | top3_avg={top3_log}")
            # print(f"[RSSI 3s] {window_log}")
            # print(f"[Area] floor={floor}, area={area}")
            # print(f"[Path] start={start_node}, path_len={len(best_path)}")

            # # 7) 브로드캐스트 (최근 3초 배치 & 평균 Top3 포함)
            # payload = {
            #     "floor": floor,
            #     "snapped_list": [list(start_node)],
            #     "best_path": [list(pt) for pt in best_path],
            #     "note": "live_update",
            #     "method": method,
            #     "area": area,
            #     "emit_interval_sec": EMIT_INTERVAL,
            #     "debug": {
            #         "top3": top3,                  # ⬅ 3초 평균값으로 만든 Top3
            #         "tag_xy": [x, y],
            #         "recent_batches": list(window) # 최근 3개의 1초 리스트
            #     },
            # }
            # await asyncio.gather(
            #     *[c.send(json.dumps(payload, ensure_ascii=False)) for c in list(clients)]
            # )

            # last_emit_ts = now

    except Exception as e:
        print(f"[WS] exception from {peer}:", e)
    finally:
        clients.discard(ws)
        print(f"[WS] client disconnected: {peer}  (now {len(clients)} client(s))")


async def main():
    print(f"WebSocket server listening on ws://{HOST}:{PORT}")
    async with websockets.serve(handle, HOST, PORT, ping_interval=20, ping_timeout=20):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
