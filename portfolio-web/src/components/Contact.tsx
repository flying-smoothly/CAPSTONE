import { Mail, Github, Send, MapPin } from 'lucide-react';

const contactItems = [
  {
    icon: <Mail size={22} />,
    label: 'Email',
    value: 'apalebluedot9283@gmail.com',
    href: 'mailto:apalebluedot9283@gmail.com',
    color: 'from-red-400 to-pink-500',
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  {
    icon: <Github size={22} />,
    label: 'GitHub',
    value: 'github.com/flying-smoothly',
    href: 'https://github.com/flying-smoothly',
    color: 'from-gray-600 to-slate-700',
    bg: 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50',
    iconColor: 'text-gray-700 dark:text-gray-300',
  },
  {
    icon: <MapPin size={22} />,
    label: 'Location',
    value: 'Seoul, South Korea 🇰🇷',
    href: null,
    color: 'from-primary-400 to-accent-500',
    bg: 'bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800/50',
    iconColor: 'text-primary-600 dark:text-primary-400',
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 section-fade">
          <span className="inline-block text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Contact
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            연락하기
          </h2>
          <p className="mt-3 text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
            협업, 채용, 프로젝트 문의 등 언제든 편하게 연락해 주세요!
          </p>
        </div>

        <div className="section-fade grid md:grid-cols-3 gap-5 mb-10">
          {contactItems.map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center text-center p-6 rounded-2xl border ${item.bg} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-md`}>
                {item.icon}
              </div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                {item.label}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className={`text-sm font-medium ${item.iconColor} hover:underline break-all`}
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="section-fade text-center">
          <div className="inline-block p-8 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 rounded-3xl shadow-2xl shadow-primary-500/20">
            <div className="flex items-center justify-center gap-2 text-white mb-3">
              <Send size={20} />
              <p className="font-semibold">지금 바로 연락하세요</p>
            </div>
            <p className="text-primary-200 text-sm mb-5">
              새로운 기회와 협업을 기다리고 있습니다.
            </p>
            <a
              href="mailto:apalebluedot9283@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Mail size={16} />
              이메일 보내기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
