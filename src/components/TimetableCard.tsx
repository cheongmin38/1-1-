import { useState, useEffect } from 'react';
import { Clock, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { fetchDailyTimetable, type TimetableInfo } from '@/src/lib/neis';

export default function TimetableCard() {
  const [timetable, setTimetable] = useState<TimetableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadTimetable() {
      try {
        setLoading(true);
        const data = await fetchDailyTimetable();
        setTimetable(data);
        setError(false);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, []);

  const currentHour = new Date().getHours();
  // Simplified current period logic
  const getCurrentPeriod = () => {
    if (currentHour < 9) return 0;
    if (currentHour < 10) return 1;
    if (currentHour < 11) return 2;
    if (currentHour < 12) return 3;
    if (currentHour < 13) return 4;
    if (currentHour < 14) return 5;
    if (currentHour < 15) return 6;
    if (currentHour < 16) return 7;
    return 0;
  };

  const activePeriod = getCurrentPeriod();

  const getSubjectEmoji = (subjectName: string) => {
    if (!subjectName) return '📚';
    if (subjectName.includes('국어') || subjectName.includes('문학') || subjectName.includes('독서')) return '📖';
    if (subjectName.includes('수학') || subjectName.includes('기하') || subjectName.includes('미분')) return '📐';
    if (subjectName.includes('영어') || subjectName.includes('외국어')) return '🔤';
    if (subjectName.includes('과학') || subjectName.includes('물리') || subjectName.includes('화학') || subjectName.includes('생명') || subjectName.includes('지구')) return '🧪';
    if (subjectName.includes('사회') || subjectName.includes('역사') || subjectName.includes('윤리') || subjectName.includes('지리') || subjectName.includes('한국사')) return '🌍';
    if (subjectName.includes('체육') || subjectName.includes('운동')) return '⚽';
    if (subjectName.includes('음악')) return '🎵';
    if (subjectName.includes('미술')) return '🎨';
    if (subjectName.includes('정보') || subjectName.includes('컴퓨터') || subjectName.includes('코딩')) return '💻';
    if (subjectName.includes('기술') || subjectName.includes('가정')) return '🛠️';
    if (subjectName.includes('자율') || subjectName.includes('진로') || subjectName.includes('창체') || subjectName.includes('동아리')) return '✨';
    if (subjectName.includes('일본어')) return '🍣';
    if (subjectName.includes('중국어')) return '🥟';
    if (subjectName.includes('한문')) return '📜';
    return '📚';
  };

  return (
    <div className="ios-card flex flex-col h-full bg-white relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-[#1C1C1E] tracking-tight">학급 시간표</h2>
          <span className="text-[9px] font-black text-ios-gray uppercase tracking-widest opacity-60">Daily Schedule</span>
        </div>
        <div className="w-10 h-10 bg-ios-blue/5 rounded-xl flex items-center justify-center text-ios-blue border border-ios-blue/10">
          <Calendar className="w-5 h-5" />
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-ios-blue animate-spin opacity-40" />
            <p className="text-[9px] font-bold text-ios-gray uppercase tracking-widest text-center opacity-70">Fetching...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 gap-2 text-center">
            <AlertCircle className="w-8 h-8 text-ios-red opacity-40" />
            <p className="text-[9px] font-bold text-ios-red uppercase tracking-tight">Load Error</p>
          </div>
        ) : timetable.length > 0 ? (
          <div className="space-y-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((period) => {
              const subject = timetable.find(t => parseInt(t.perio) === period);
              const isActive = activePeriod === period;
              
              return (
                <div 
                  key={period}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all border",
                    isActive 
                      ? "bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-sm scale-[1.02]" 
                      : "bg-ios-bg/30 text-[#1C1C1E] border-transparent"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black",
                    isActive ? "bg-white/10 text-white" : "bg-ios-bg text-ios-gray/80"
                  )}>
                    {period}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className={cn(
                      "text-sm font-bold tracking-tight flex items-center gap-2",
                      !subject && !isActive && "opacity-30"
                    )}>
                      <span className="text-base leading-none">{getSubjectEmoji(subject?.itrtNm || '')}</span> 
                      {subject?.itrtNm || '자습/기타'}
                    </span>
                  </div>
                  {isActive && (
                    <div className="flex items-center gap-1.5 bg-ios-blue px-2 py-0.5 rounded-md">
                      <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                      <span className="text-[8px] font-black uppercase text-white">LIVE</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center opacity-30">
            <Clock className="w-8 h-8 mb-2 text-[#1C1C1E]" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No Class Today</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-black/[0.03] flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-ios-gray opacity-60">
         <span>Schedule</span>
         <span className="text-ios-blue">NEIS API</span>
      </div>
    </div>
  );
}
