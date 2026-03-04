import { Monitor, Server, Wrench, Cpu } from 'lucide-react';
import type { ReactNode } from 'react';

interface Skill {
  name: string;
  level: number;
  color: string;
}

interface SkillCategory {
  icon: ReactNode;
  label: string;
  color: string;
  bgColor: string;
  skills: Skill[];
}

const categories: SkillCategory[] = [
  {
    icon: <Monitor size={20} />,
    label: 'Frontend',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50',
    skills: [
      { name: 'TypeScript', level: 85, color: 'from-blue-400 to-blue-600' },
      { name: 'React', level: 80, color: 'from-cyan-400 to-blue-500' },
      { name: 'React Native', level: 75, color: 'from-sky-400 to-cyan-500' },
      { name: 'HTML / CSS', level: 85, color: 'from-orange-400 to-red-500' },
      { name: 'Tailwind CSS', level: 80, color: 'from-teal-400 to-cyan-500' },
    ],
  },
  {
    icon: <Server size={20} />,
    label: 'Backend & AI',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50',
    skills: [
      { name: 'Python', level: 90, color: 'from-yellow-400 to-green-500' },
      { name: 'Java', level: 70, color: 'from-orange-400 to-red-500' },
      { name: 'WebSocket', level: 80, color: 'from-purple-400 to-indigo-500' },
      { name: 'RAG / LLM (Llama 3)', level: 75, color: 'from-pink-400 to-rose-500' },
      { name: 'FAISS / Embeddings', level: 75, color: 'from-violet-400 to-purple-500' },
    ],
  },
  {
    icon: <Cpu size={20} />,
    label: 'Embedded & IoT',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/50',
    skills: [
      { name: 'Arduino (C++)', level: 80, color: 'from-teal-400 to-green-500' },
      { name: 'Raspberry Pi', level: 78, color: 'from-red-400 to-pink-500' },
      { name: 'BLE / Bluetooth', level: 82, color: 'from-blue-400 to-indigo-500' },
      { name: 'Serial Communication', level: 80, color: 'from-gray-400 to-slate-500' },
      { name: 'Kotlin (Android)', level: 65, color: 'from-purple-400 to-violet-500' },
    ],
  },
  {
    icon: <Wrench size={20} />,
    label: 'DevOps & Tools',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/50',
    skills: [
      { name: 'Git / GitHub', level: 88, color: 'from-gray-500 to-slate-600' },
      { name: 'Firebase', level: 80, color: 'from-yellow-400 to-orange-500' },
      { name: 'Streamlit', level: 78, color: 'from-red-400 to-pink-400' },
      { name: 'Expo', level: 75, color: 'from-indigo-400 to-blue-500' },
      { name: 'Vite / npm', level: 80, color: 'from-amber-400 to-yellow-500' },
    ],
  },
];

function SkillBar({ skill }: { skill: Skill }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{skill.name}</span>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{skill.level}%</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${skill.color} transition-all duration-1000 ease-out`}
          style={{ width: `${skill.level}%` }}
        />
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 section-fade">
          <span className="inline-block text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Skills
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            기술 스택
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 text-base">
            다양한 도메인에서 쌓아온 기술들
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className={`section-fade p-6 rounded-2xl border ${cat.bgColor} transition-all duration-300 hover:shadow-lg hover:scale-[1.01]`}
            >
              {/* Category header */}
              <div className={`flex items-center gap-2 mb-5 ${cat.color}`}>
                {cat.icon}
                <h3 className="font-bold text-base">{cat.label}</h3>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                {cat.skills.map((skill) => (
                  <SkillBar key={skill.name} skill={skill} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
