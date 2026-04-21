import { useState, useEffect } from 'react';
import { Timer, Star, PartyPopper } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface DDay {
  label: string;
  date: string;
  color: string;
}

export default function DDayCard() {
  const [days, setDays] = useState<DDay[]>([
    { label: '1학기 중간고사', date: '2026-04-27', color: 'bg-ios-red' },
    { label: '1학기 기말고사', date: '2026-07-01', color: 'bg-ios-orange' },
    { label: '여름방학 시작', date: '2026-07-17', color: 'bg-ios-blue' },
  ]);

  const calculateDDay = (targetDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diff = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'D-Day';
    return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="ios-card flex flex-col h-full bg-white relative overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
           <h2 className="text-xl font-black text-[#1C1C1E] tracking-tight">학사 일정</h2>
           <span className="text-[10px] font-black text-ios-gray uppercase tracking-widest">Academic Calendar</span>
        </div>
        <div className="bg-[#F2F2F7] p-2 rounded-2xl">
          <Timer className="w-4 h-4 text-ios-gray" />
        </div>
      </div>

      <div className="space-y-2 flex-1">
        {days.map((d, i) => (
          <div key={i} className="flex items-center justify-between p-5 bg-[#F2F2F7] rounded-[2rem] group transition-all hover:bg-white hover:shadow-xl hover:scale-[1.02] border border-transparent hover:border-black/[0.03]">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${d.color} shadow-lg shadow-current/30`} />
              <div className="flex flex-col">
                <span className="text-sm font-black text-[#1C1C1E] tracking-tight">{d.label}</span>
                <span className="text-[9px] font-bold text-ios-gray uppercase tracking-widest">{d.date}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
               <span className={cn(
                 "text-xl font-black tracking-tighter",
                 d.label.includes('중간') ? "text-ios-red" : "text-[#1C1C1E]"
               )}>
                 {calculateDDay(d.date)}
               </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
