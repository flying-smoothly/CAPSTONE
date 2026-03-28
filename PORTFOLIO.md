# 프로젝트 소개: BLE 비콘 기반 실내 측위 및 긴급 대피 안내 앱

## 프로젝트 개요

GPS 신호가 닿지 않는 실내 환경에서 BLE 비콘의 RSSI를 활용해 사용자 위치를 실시간으로 추정하고, 화재 등 긴급 상황 발생 시 최적 대피 경로를 안내하는 크로스플랫폼 모바일 애플리케이션입니다. 캡스톤 디자인 프로젝트로 진행되었으며, 모바일 앱·Python 백엔드·JavaFX 뷰어까지 직접 구현한 풀스택 IoT 시스템입니다. 층별 도면 이미지 위에 현재 위치와 경로를 오버레이하는 방식으로 직관적인 실내 내비게이션 경험을 제공합니다.

## 기술 스택 및 아키텍처

모바일 앱은 `React Native(Expo)` + `TypeScript`로 iOS/Android 공통 코드베이스를 유지하며, BLE 스캔에는 `react-native-ble-plx`를 사용합니다. 앱과 위치 계산 서버 간 통신은 `WebSocket`으로 실시간 RSSI 배치를 전송하고, 서버는 `Python`으로 삼변측량(Trilateration) 및 경로 탐색을 처리합니다. 층별 도면 시각화는 `FloorCalibratedMap.tsx` 컴포넌트와, 별도의 `Java(JavaFX)` 기반 데스크톱 뷰어(`Main.java`)를 통해 이중으로 제공합니다. 플랫폼별 분기는 `useBle.native.ts` / `useBle.web.ts` 파일 분리 방식으로 처리해 웹 환경에서도 빌드가 깨지지 않도록 설계된 것으로 보입니다.

## 핵심 구현 로직

`useBle.native.ts`의 `useBle` 훅이 이 프로젝트의 기술적 핵심입니다. BLE 스캔 콜백 `onScan()`에서 수신된 RSSI에 EMA(지수 이동 평균) 필터를 적용해(`emaAlpha = 0.1`) 신호 노이즈를 억제하고, `rssiToDistance()` 함수가 `distance = 10^((rssi0 - rssi) / 20)` 공식으로 거리를 추정합니다. 이 공식과 교정값(`rssi0 = -86`)은 실험 측정값에서 도출된 것으로 추정됩니다. 측정값은 `latestRef`(Map)에 비콘 ID별 최신 1건만 보유하고, `emitIntervalMs`(기본 1,000ms) 주기의 인터벌 타이머가 WebSocket으로 전체 배치를 전송합니다. `FloorCalibratedMap.tsx`는 CAD 도면 좌표계를 화면 픽셀 좌표로 변환하는 어파인 매핑(`toPixel`)과, `expo-asset`으로 로드한 원본 이미지 크기 기반 `contain` 스케일링을 조합해 어떤 해상도에서도 좌표가 정확하게 일치하도록 처리합니다.
