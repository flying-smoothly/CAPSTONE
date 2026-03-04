import { useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Calendar,
  Target,
  User,
  Wrench,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Briefcase,
  Github,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import type { ProjectDetail } from '../data/projectsData';

interface Props {
  project: ProjectDetail;
  onBack: () => void;
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  gradient: string;
  children: React.ReactNode;
}

function Section({ icon, title, gradient, children }: SectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('opacity-100', 'translate-y-0');
          el.classList.remove('opacity-0', 'translate-y-6');
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-6 transition-all duration-700 ease-out"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Section header */}
        <div className={`px-6 py-4 bg-gradient-to-r ${gradient} bg-opacity-10`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>
              {icon}
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
        </div>
        {/* Content */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
      {lines.map((line, i) => {
        if (line.trim() === '') return <div key={i} className="h-1" />;

        // Bold headings like **[제목]**
        const boldHeadingMatch = line.match(/^\*\*(.+)\*\*$/);
        if (boldHeadingMatch) {
          return (
            <p key={i} className="font-semibold text-gray-800 dark:text-gray-200 mt-4 first:mt-0">
              {boldHeadingMatch[1]}
            </p>
          );
        }

        // Inline bold **text** mixed with normal text
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) => {
              const boldMatch = part.match(/^\*\*(.+)\*\*$/);
              if (boldMatch) {
                return (
                  <strong key={j} className="font-semibold text-gray-800 dark:text-gray-200">
                    {boldMatch[1]}
                  </strong>
                );
              }
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function ProjectDetail({ project, onBack }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          포트폴리오로 돌아가기
        </button>

        {/* Hero header */}
        <div className="opacity-0 translate-y-6 animate-fade-in-up mb-10">
          <div className={`rounded-2xl bg-gradient-to-br ${project.gradient} p-8 text-white shadow-xl`}>
            <div className="flex items-start gap-4 mb-4">
              <span className="text-5xl drop-shadow-md">{project.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-xs font-semibold bg-white/20 backdrop-blur-sm rounded-full border border-white/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-1">
                  {project.name}
                </h1>
                <p className="text-white/80 text-base font-medium">{project.nameKo}</p>
              </div>
            </div>
            <p className="text-white/90 text-sm leading-relaxed border-t border-white/20 pt-4 mt-2">
              {project.tagline}
            </p>
            {/* Links */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-semibold border border-white/30 transition-all hover:scale-105"
              >
                <Github size={15} /> GitHub
              </a>
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 hover:bg-white/90 rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-md"
              >
                <ExternalLink size={15} /> 저장소 방문
              </a>
            </div>
          </div>
        </div>

        {/* Sections grid */}
        <div className="space-y-5">

          {/* Period */}
          <Section
            icon={<Calendar size={16} />}
            title="프로젝트 기간"
            gradient={project.gradient}
          >
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {project.period}
            </p>
          </Section>

          {/* Purpose */}
          <Section
            icon={<Target size={16} />}
            title="목적 / 배경"
            gradient={project.gradient}
          >
            <MarkdownText text={project.purpose} />
          </Section>

          {/* My Role */}
          <Section
            icon={<User size={16} />}
            title="내 역할"
            gradient={project.gradient}
          >
            <MarkdownText text={project.myRole} />
          </Section>

          {/* Tech Stack */}
          <Section
            icon={<Wrench size={16} />}
            title="사용 기술 / 도구"
            gradient={project.gradient}
          >
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Section>

          {/* Achievements */}
          <Section
            icon={<TrendingUp size={16} />}
            title="주요 성과 (정량적)"
            gradient={project.gradient}
          >
            <ul className="space-y-3">
              {project.achievements.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2
                    size={16}
                    className="shrink-0 mt-0.5 text-emerald-500 dark:text-emerald-400"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Challenges */}
          <Section
            icon={<AlertTriangle size={16} />}
            title="어려웠던 점"
            gradient={project.gradient}
          >
            <MarkdownText text={project.challenges} />
          </Section>

          {/* Solutions */}
          <Section
            icon={<Lightbulb size={16} />}
            title="해결 방법"
            gradient={project.gradient}
          >
            <MarkdownText text={project.solutions} />
          </Section>

          {/* Learnings */}
          <Section
            icon={<BookOpen size={16} />}
            title="배운 점"
            gradient={project.gradient}
          >
            <ul className="space-y-3">
              {project.learnings.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`shrink-0 mt-1.5 w-2 h-2 rounded-full bg-gradient-to-br ${project.gradient}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Related Skills */}
          <Section
            icon={<Briefcase size={16} />}
            title="관련 직무 역량"
            gradient={project.gradient}
          >
            <div className="flex flex-wrap gap-2">
              {project.relatedSkills.map((skill) => (
                <span
                  key={skill}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r ${project.gradient} text-white shadow-sm`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>

        </div>

        {/* Bottom back button */}
        <div className="mt-12 text-center">
          <button
            onClick={onBack}
            className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${project.gradient} text-white text-sm font-semibold rounded-xl hover:opacity-90 hover:scale-105 transition-all shadow-md`}
          >
            <ArrowLeft size={16} />
            포트폴리오로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
