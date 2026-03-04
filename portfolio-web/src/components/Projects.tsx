import { Github, ExternalLink, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useState } from 'react';
import { projectsData } from '../data/projectsData';
import type { ProjectDetail } from '../data/projectsData';

interface ProjectCardProps {
  project: ProjectDetail;
  onViewDetail: (id: string) => void;
}

function ProjectCard({ project, onViewDetail }: ProjectCardProps) {
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
          <button
            onClick={() => onViewDetail(project.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-primary-200 dark:border-primary-800/50 transition-all"
          >
            <FileText size={13} />
            상세 보기
          </button>
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

interface ProjectsProps {
  onViewDetail: (id: string) => void;
}

export default function Projects({ onViewDetail }: ProjectsProps) {
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
          {projectsData.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
