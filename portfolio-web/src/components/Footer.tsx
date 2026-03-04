import { Github, Mail, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          © 2024 하서휘. Made with{' '}
          <Heart size={12} className="text-red-400 fill-red-400" /> using React + Tailwind CSS.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="mailto:apalebluedot9283@gmail.com"
            className="text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            aria-label="Email"
          >
            <Mail size={18} />
          </a>
          <a
            href="https://github.com/flying-smoothly"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
