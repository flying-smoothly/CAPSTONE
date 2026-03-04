import { Github, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Project {
  name: string;
  nameKo: string;
  emoji: string;
  tagline: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  gradient: string;
  tags: string[];
}

const projects: Project[] = [
  {
    name: 'CAPSTONE',
    nameKo: '실내 BLE 측위 & 내비게이션 시스템',
    emoji: '📡',
    tagline: 'BLE 비콘 기반 실시간 실내 위치 추적 시스템',
    description: `본 프로젝트는 GPS가 닿지 않는 실내 환경에서 BLE(Bluetooth Low Energy) 비콘을 활용한 실시간 위치 추적 및 내비게이션 시스템입니다.

[아키텍처 개요]
시스템은 세 레이어로 구성됩니다. 첫째, Raspberry Pi에서 실행되는 BLE 에이전트(pi_ble_agent.py)가 주변 BLE 비콘 신호를 스캔합니다. 수신된 RSSI(Received Signal Strength Indicator) 값에 지수이동평균(EMA) 필터를 적용해 노이즈를 제거하고, 2초 주기로 WebSocket 서버에 배치 전송합니다.

[서버 측위 알고리즘]
서버(server.py)는 3초 롤링 윈도우로 RSSI 데이터를 집계하고 상위 3개 비콘을 선택한 뒤, 삼변측량(Trilateration) 알고리즘으로 (x, y) 좌표를 계산합니다. 계산된 좌표는 사전 정의된 구역 맵에 매핑되어 현재 위치 구역을 판별하고, 경로 탐색 알고리즘으로 목적지까지의 내비게이션 지시를 생성합니다.

[클라이언트 및 통신]
React Native(TypeScript)와 Kotlin으로 개발된 멀티플랫폼 클라이언트가 WebSocket을 통해 실시간으로 위치 정보를 수신합니다. 원격에서 스캔 시작/중지 명령을 전송하는 양방향 제어 기능도 구현되어 있습니다.

[결과 및 성과]
실내 위치 오차를 평균 1.5m 이내로 줄이는 데 성공했으며, 복도·방·계단 등 다양한 구역 분류를 90% 이상의 정확도로 달성했습니다.`,
    techStack: ['TypeScript', 'Python', 'Kotlin', 'WebSocket', 'Java', 'BLE', 'Raspberry Pi'],
    githubUrl: 'https://github.com/flying-smoothly/CAPSTONE',
    gradient: 'from-blue-500 to-indigo-600',
    tags: ['IoT', 'Real-time', 'Mobile'],
  },
  {
    name: 'AI Semiconductor Contest',
    nameKo: 'AI 보이스피싱 탐지 금융 챗봇',
    emoji: '🛡️',
    tagline: 'RAG + Llama 3 기반 실시간 보이스피싱 탐지 시스템',
    description: `AI 반도체 경진대회에서 제출한 프로젝트로, 급증하는 보이스피싱 피해를 막기 위해 AI 기술을 결합한 실시간 탐지 및 금융 상담 챗봇 시스템입니다.

[핵심 파이프라인: RAG 기반 탐지]
실제 보이스피싱 시나리오 데이터를 수집하고 SentenceTransformer로 임베딩한 뒤 FAISS 벡터 인덱스에 저장합니다. 실시간 통화 내용이 입력되면 유사 시나리오를 빠르게 검색(Retrieval)하고, Meta Llama 3 모델이 검색 결과를 컨텍스트로 삼아 사기 여부를 분석(Generation)합니다.

[음성 인식 및 TTS]
Naver Clova API를 통해 단문·장문·실시간 세 가지 모드의 음성 인식을 지원합니다. 분석 결과는 TTS(Text-to-Speech) 엔진을 통해 음성으로 피드백되어 고령 사용자도 쉽게 활용할 수 있습니다.

[AI 반도체 최적화]
Llama 3 모델을 RBLN(Rebellions AI NPU) 환경에 컴파일·최적화하여 하드웨어 가속 추론을 구현했습니다. 배치 처리 파이프라인으로 토큰 생성 처리량(throughput)을 측정하고 최적화했습니다.

[인터페이스]
Streamlit 기반의 대화형 UI를 구현하여 데모 시연 및 테스트가 용이하도록 했습니다. 대화 맥락을 기억하는 메모리 기능을 통해 자연스러운 멀티턴 대화를 지원합니다.`,
    techStack: ['Python', 'Llama 3', 'FAISS', 'SentenceTransformer', 'Clova API', 'Streamlit', 'RAG'],
    githubUrl: 'https://github.com/flying-smoothly/ai-semiconductor-contest',
    gradient: 'from-purple-500 to-pink-600',
    tags: ['AI/ML', 'LLM', 'Security'],
  },
  {
    name: 'red_show',
    nameKo: '자동화 액체 분주 제어 시스템',
    emoji: '🤖',
    tagline: 'Firebase 연동 Arduino 기반 정밀 액체 분주 자동화',
    description: `실험실 또는 음료 자동화 환경에서 사용하는 정밀 액체 분주 시스템으로, Firebase 클라우드 데이터베이스와 Arduino UNO 마이크로컨트롤러를 결합한 IoT 자동화 솔루션입니다.

[시스템 구성]
Python 제어 서버가 Firebase Realtime Database에서 레시피(성분별 비율)를 실시간으로 받아옵니다. 각 성분의 목표량을 모터 스텝 수로 변환(50μL당 200스텝 기준)하고, 계산된 명령을 Arduino UNO에 전송합니다.

[Arduino 제어]
"ZEUS" 명칭의 Arduino 모듈은 CW(시계방향)/CCW(반시계방향) 명령을 받아 스텝 모터를 정밀 제어합니다. 각 성분 분주 사이에는 피펫을 500μL 기준점으로 초기화하여 잔여물 없이 정확한 분주가 이루어지도록 합니다. 1000μL 단위 자동 분배 및 나머지량 처리 로직도 구현되어 있습니다.

[통신 이중화]
USB 직접 시리얼(COM5)과 Bluetooth 시리얼 두 가지 연결 방식을 모두 지원하여, 설치 환경에 따라 유연하게 선택할 수 있습니다.

[실용적 활용]
소규모 실험실 자동화, 칵테일/음료 자동 제조, 화장품 소분 등 정밀 계량이 필요한 다양한 분야에 적용 가능합니다. Firebase를 통한 원격 레시피 변경으로 재프로그래밍 없이 운영이 가능합니다.`,
    techStack: ['Python', 'C++ (Arduino)', 'Firebase', 'Bluetooth', 'Serial', 'IoT'],
    githubUrl: 'https://github.com/flying-smoothly/red_show',
    gradient: 'from-orange-500 to-red-600',
    tags: ['Embedded', 'IoT', 'Automation'],
  },
  {
    name: 'manage-web-push',
    nameKo: '웹 푸시 알림 관리 플랫폼',
    emoji: '🔔',
    tagline: 'Web Push API 기반 대규모 알림 발송 & 관리 시스템',
    description: `Web Push Protocol을 활용한 브라우저 기반 푸시 알림 관리 플랫폼으로, 사용자 구독 관리부터 세그먼트별 타겟 발송, 발송 이력 분석까지 통합 제공합니다.

[핵심 기능]
VAPID(Voluntary Application Server Identification) 인증 기반의 안전한 Web Push 발송을 구현했습니다. 사용자는 브라우저에서 알림을 구독하면 Endpoint와 암호화 키가 서버에 등록됩니다. 발송 시 web-push 라이브러리를 통해 각 구독자에게 암호화된 메시지를 전달합니다.

[구독자 관리]
사용자별 구독 상태 추적, 디바이스 유형(데스크탑/모바일) 분류, 활성/비활성 구독 관리 기능을 제공합니다. 그룹 또는 세그먼트 단위로 타겟 발송이 가능하여 마케팅/운영 목적으로 활용할 수 있습니다.

[Expo 멀티플랫폼]
Expo 프레임워크를 기반으로 웹, Android, iOS를 단일 코드베이스로 지원합니다. expo-notifications API를 활용해 네이티브 앱 환경에서도 동일한 알림 경험을 제공합니다.

[운영 및 분석]
발송 성공/실패 통계, 클릭률(CTR) 추적, 시간대별 발송 스케줄링 기능을 내장하여 알림 효과를 데이터 기반으로 분석하고 최적화할 수 있습니다.`,
    techStack: ['TypeScript', 'React Native', 'Expo', 'Web Push', 'Firebase', 'Node.js'],
    githubUrl: 'https://github.com/flying-smoothly/manage-web-push',
    gradient: 'from-green-500 to-teal-600',
    tags: ['Mobile', 'Web', 'Notifications'],
  },
  {
    name: 'bps',
    nameKo: 'BLE 측위 지원 라이브러리 & 도구',
    emoji: '🗺️',
    tagline: 'BLE 기반 실내 측위를 위한 핵심 유틸리티 모음',
    description: `CAPSTONE 프로젝트의 BLE 측위 시스템을 구성하는 핵심 알고리즘과 도구 모음입니다. 독립 라이브러리 형태로 분리하여 재사용성과 테스트 편의성을 높였습니다.

[RSSI 처리 모듈]
BLE 비콘 신호는 환경 간섭에 민감하므로 다양한 필터링 알고리즘을 제공합니다. EMA(지수이동평균), 칼만 필터, 가중 평균 방식을 비교 테스트하고, 환경 특성에 맞는 필터를 선택할 수 있도록 추상화했습니다. RSSI-to-Distance 변환에는 로그 거리 경로 손실 모델을 적용합니다.

[삼변측량 엔진]
3개 이상의 비콘 거리 정보를 입력받아 최소제곱법(Least Squares) 기반의 삼변측량으로 2D 좌표를 계산합니다. 비콘 위치 캘리브레이션 도구와 측위 정확도 평가 메트릭도 포함되어 있습니다.

[비콘 관리]
각 비콘의 UUID, Major, Minor, 물리적 위치 좌표, 환경 파라미터(TX Power, Path Loss Exponent)를 JSON 설정 파일로 관리합니다. 새 비콘 추가 및 캘리브레이션 워크플로우를 CLI 도구로 지원합니다.

[데이터 수집 및 시각화]
측위 결과를 로그로 기록하고, 궤적 시각화 및 정확도 분석 리포트를 자동 생성하는 스크립트를 제공합니다. 이를 통해 비콘 배치 최적화 및 알고리즘 튜닝에 활용할 수 있습니다.`,
    techStack: ['Python', 'TypeScript', 'BLE', 'WebSocket', 'Raspberry Pi', 'Algorithm'],
    githubUrl: 'https://github.com/flying-smoothly/bps',
    gradient: 'from-cyan-500 to-blue-600',
    tags: ['Library', 'Algorithm', 'IoT'],
  },
];

function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

  const previewText = project.description.slice(0, 180) + '...';

  return (
    <div className="section-fade group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Top gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${project.gradient}`} />

      {/* Card body */}
      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{project.emoji}</span>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                {project.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{project.nameKo}</p>
            </div>
          </div>
          {/* Tags */}
          <div className="flex flex-col gap-1 items-end shrink-0">
            {project.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full border border-primary-100 dark:border-primary-800/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
          {project.tagline}
        </p>

        {/* Description */}
        <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 whitespace-pre-line flex-1">
          {expanded ? project.description : previewText}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={14} /> 접기
            </>
          ) : (
            <>
              <ChevronDown size={14} /> 자세히 보기
            </>
          )}
        </button>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-5">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg border border-gray-100 dark:border-gray-700"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Footer links */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Github size={15} />
            GitHub
          </a>
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`ml-auto flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r ${project.gradient} text-white text-xs font-semibold rounded-lg hover:opacity-90 hover:scale-105 transition-all shadow-sm`}
          >
            View Project <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 section-fade">
          <span className="inline-block text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Projects
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            프로젝트
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 text-base">
            AI · IoT · 풀스택을 아우르는 5가지 프로젝트
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
