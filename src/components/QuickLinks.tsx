import { motion } from 'motion/react';
import { ExternalLink, Globe, School, BookOpen, GraduationCap } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function QuickLinks() {
  const links = [
    { label: '평택고 홈페이지', url: 'https://pyeongtaek-h.goept.kr/pyeongtaek-h/main.do', icon: School, color: 'text-blue-500' },
    { label: '경기도 교육청', url: 'https://www.goe.go.kr/', icon: Globe, color: 'text-green-500' },
    { label: 'EBSi 수능강의', url: 'http://www.ebsi.co.kr/', icon: BookOpen, color: 'text-orange-500' },
    { label: '커리어넷 (진로)', url: 'https://www.career.go.kr/', icon: GraduationCap, color: 'text-purple-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {links.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ios-card p-4 flex flex-col items-center justify-center gap-2 group transition-all"
        >
          <div className={cn("p-3 rounded-2xl bg-ios-bg group-hover:bg-ios-blue/5 group-hover:text-ios-blue transition-colors", link.color)}>
            <link.icon className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-[#1C1C1E] tracking-tight">{link.label}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
