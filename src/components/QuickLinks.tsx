import { motion } from 'motion/react';
import { ExternalLink, Globe, School, BookOpen, GraduationCap } from 'lucide-react';

export default function QuickLinks() {
  const links = [
    { label: '평택고 홈페이지', url: 'https://pyeongtaek-h.goept.kr/pyeongtaek-h/main.do', icon: School, color: 'text-blue-500' },
    { label: '경기도 교육청', url: 'https://www.goe.go.kr/', icon: Globe, color: 'text-green-500' },
    { label: 'EBSi 수능강의', url: 'http://www.ebsi.co.kr/', icon: BookOpen, color: 'text-orange-500' },
    { label: '커리어넷 (진로)', url: 'https://www.career.go.kr/', icon: GraduationCap, color: 'text-purple-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      {links.map((link, i) => (
        <motion.a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 transition-all hover:shadow-md group"
        >
          <div className={`p-4 rounded-3xl bg-[#F5F5F7] group-hover:bg-white group-hover:scale-110 transition-all ${link.color}`}>
            <link.icon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
            <span className="text-xs font-bold text-[#1D1D1F] tracking-tight">{link.label}</span>
            <ExternalLink className="w-3 h-3 text-[#86868B]" />
          </div>
        </motion.a>
      ))}
    </div>
  );
}
