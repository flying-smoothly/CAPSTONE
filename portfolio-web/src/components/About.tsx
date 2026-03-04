import { User, Cpu, Brain, Rocket } from 'lucide-react';

const interests = [
  { icon: <Cpu size={18} />, label: 'IoT & 임베디드 시스템' },
  { icon: <Brain size={18} />, label: 'AI / 머신러닝' },
  { icon: <Rocket size={18} />, label: '풀스택 웹 개발' },
];

const stats = [
  { value: '5+', label: '프로젝트' },
  { value: '3+', label: '언어 도메인' },
  { value: '4+', label: '기술 스택' },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 section-fade">
          <span className="inline-block text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-widest mb-3">
            About Me
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            저는 이런 개발자입니다
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: avatar & stats */}
          <div className="section-fade flex flex-col items-center lg:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-2xl shadow-primary-500/20">
                <User size={72} className="text-white/90" />
              </div>
              <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
                <span className="text-2xl">🚀</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  <div className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{s.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: description */}
          <div className="section-fade space-y-6">
            <div className="space-y-4 text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              <p>
                안녕하세요! 저는 <strong className="text-gray-900 dark:text-white">하서휘</strong>입니다.
                BLE 기반 실내 측위 시스템부터 AI 보이스피싱 탐지, IoT 자동화 시스템까지
                다양한 도메인에서 실용적인 문제를 해결하는 것을 즐깁니다.
              </p>
              <p>
                하드웨어와 소프트웨어의 경계를 넘나들며, <strong className="text-gray-900 dark:text-white">임베디드 시스템(Arduino/Raspberry Pi)</strong>부터
                <strong className="text-gray-900 dark:text-white"> AI/ML(RAG, LLM, FAISS)</strong>, 그리고
                <strong className="text-gray-900 dark:text-white"> 풀스택 웹·모바일 개발</strong>까지
                넓은 기술 스펙트럼을 보유하고 있습니다.
              </p>
              <p>
                데이터가 실제 세계와 만나는 접점, 즉 센서·통신·알고리즘이 결합된 시스템을
                설계하고 구현하는 과정에서 큰 보람을 느낍니다.
              </p>
            </div>

            {/* Interests */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                관심 분야
              </h3>
              <div className="flex flex-wrap gap-3">
                {interests.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-medium border border-primary-100 dark:border-primary-800/50"
                  >
                    {item.icon}
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
