// app/(tabs)/map.tsx  (웹/네이티브 공용)
import { View, Text, Button, ScrollView } from "react-native";
import { useBle } from "@/hooks/useBle.web"; // ★ 웹이면 .web.ts가 자동 사용
import { sendStartScan, sendStopScan } from "@/config/ws";
import React from "react";

export default function MapScreen() {
  const { wsConnected, isScanning, latestList, reconnectWs } =
    useBle({ wsUrl: "ws://10.101.30.71:8000" });

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>WS Connected: {String(wsConnected)}</Text>
      <Text>Agent Scanning: {String(isScanning)}</Text>

      <View style={{ flexDirection: "row", gap: 12, marginVertical: 12 }}>
        <Button title="START SCAN" onPress={sendStartScan} disabled={!wsConnected || isScanning} />
        <Button title="STOP SCAN"  onPress={sendStopScan}  disabled={!wsConnected || !isScanning} />
        <Button title="RECONNECT WS" onPress={reconnectWs} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {latestList.sort((a,b)=>a.id-b.id).map((r) => (
          <Text key={r.id} style={{ marginBottom: 6 }}>
            #{r.id} {r.name} | RSSI {r.rssi} | filt {r.filtered?.toFixed?.(1)} | d {r.distance} m
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}