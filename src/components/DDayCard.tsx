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
    <div className="ios-card flex flex-col h-full bg-white relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
           <h2 className="text-xl font-bold text-[#1C1C1E] tracking-tight">학사 일정</h2>
           <span className="text-[9px] font-black text-ios-gray uppercase tracking-widest opacity-60">Calendar</span>
        </div>
        <div className="bg-ios-bg p-2 rounded-xl border border-black/[0.01]">
          <Timer className="w-4 h-4 text-ios-gray" />
        </div>
      </div>

      <div className="space-y-1.5 flex-1">
        {days.map((d, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-ios-bg/40 rounded-2xl border border-transparent hover:border-black/[0.03] transition-all">
            <div className="flex items-center gap-3">
              <div className={cn("w-1.5 h-1.5 rounded-full ring-4 ring-white shadow-sm", d.color)} />
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#1C1C1E] tracking-tight">{d.label}</span>
                <span className="text-[8px] font-black text-ios-gray uppercase tracking-widest">{d.date}</span>
              </div>
            </div>
            <span className={cn(
              "text-lg font-black tracking-tighter tabular-nums",
              d.label.includes('중간') ? "text-ios-red" : "text-[#1C1C1E]"
            )}>
              {calculateDDay(d.date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
