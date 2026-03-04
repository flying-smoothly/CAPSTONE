import { useEffect, useState } from 'react';
import { useDarkMode } from './hooks/useDarkMode';
import { useScrollAnimation } from './hooks/useScrollAnimation';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProjectDetail from './components/ProjectDetail';
import { projectsData } from './data/projectsData';

function App() {
  const { isDark, toggle } = useDarkMode();
  useScrollAnimation();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const activeProject = activeProjectId
    ? projectsData.find((p) => p.id === activeProjectId) ?? null
    : null;

  // Re-run scroll animation observer when portfolio sections mount
  useEffect(() => {
    if (activeProject) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.08 }
    );
    const elements = document.querySelectorAll('.section-fade');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeProject]);

  if (activeProject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
        <Navbar isDark={isDark} toggleDark={toggle} />
        <ProjectDetail
          project={activeProject}
          onBack={() => {
            setActiveProjectId(null);
            setTimeout(() => {
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar isDark={isDark} toggleDark={toggle} />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects onViewDetail={(id) => setActiveProjectId(id)} />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
