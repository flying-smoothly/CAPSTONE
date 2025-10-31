import { View, Text, Button, ScrollView } from "react-native";
import { useBle } from "@/hooks/useBle"; // 경로는 프로젝트에 맞게

export default function MapScreen() {
  const { ready, isScanning, wsConnected, latestList, startScan, stopScan, reconnectWs } =
    useBle({ wsUrl: "ws://10.101.30.71:8000", floor: "B2", emaAlpha: 0.1 });

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>BLE Ready: {String(ready)}</Text>
      <Text>Scanning: {String(isScanning)}</Text>
      <Text>WS Connected: {String(wsConnected)}</Text>

      <View style={{ flexDirection: "row", gap: 12, marginVertical: 12 }}>
        <Button title="Start Scan" onPress={startScan} disabled={!ready || isScanning} />
        <Button title="Stop Scan" onPress={stopScan} disabled={!isScanning} />
        <Button title="Reconnect WS" onPress={reconnectWs} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        {latestList.sort((a,b)=>a.id-b.id).map((r) => (
          <Text key={r.id} style={{ marginBottom: 6 }}>
            #{r.id} {r.name} | RSSI {r.rssi} | filt {r.filtered.toFixed(1)} | d {r.distance} m
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}