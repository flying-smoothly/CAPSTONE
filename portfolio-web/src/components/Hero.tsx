import { Github, Mail, ChevronDown, Sparkles } from 'lucide-react';

export default function Hero() {
  const scrollToSection = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-400/10 dark:from-gray-950 dark:via-gray-900 dark:to-primary-900/20" />

      {/* Animated blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-400/20 dark:bg-primary-600/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-400/15 dark:bg-accent-600/10 rounded-full blur-3xl animate-float animation-delay-400" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-300/10 rounded-full blur-3xl animate-float animation-delay-800" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-8 border border-primary-200 dark:border-primary-700/50 animate-fade-in">
          <Sparkles size={14} />
          <span>Available for opportunities</span>
        </div>

        {/* Name */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-4 animate-fade-in-up">
          <span className="block text-gray-900 dark:text-white">하서휘</span>
          <span className="block gradient-text mt-2">Ha Seohwi</span>
        </h1>

        {/* Title */}
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-600 dark:text-gray-300 mb-6 animate-fade-in-up animation-delay-200">
          AI · IoT · Full-Stack Developer
        </p>

        {/* Description */}
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-400">
          BLE 실내 측위, AI 금융 보안, 임베디드 시스템까지 —
          <br className="hidden sm:block" />
          다양한 도메인에서 실용적인 솔루션을 만드는 개발자입니다.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
          <a
            href="https://github.com/flying-smoothly"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 transition-all duration-200"
          >
            <Github size={18} />
            GitHub
          </a>
          <button
            onClick={() => scrollToSection('#contact')}
            className="group flex items-center gap-2 px-7 py-3.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-semibold hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-105 transition-all duration-200 shadow-sm"
          >
            <Mail size={18} />
            Contact
          </button>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={() => scrollToSection('#about')}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 dark:text-gray-600 hover:text-primary-500 dark:hover:text-primary-400 transition-colors animate-bounce"
          aria-label="Scroll down"
        >
          <span className="text-xs font-medium">스크롤</span>
          <ChevronDown size={20} />
        </button>
      </div>
    </section>
  );
}
