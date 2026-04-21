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
    <motion.div 
      whileHover={{ y: -5 }}
      className="ios-card flex flex-col h-full min-h-[450px] bg-white border-black/[0.01]"
    >
      <div className="flex justify-between items-center mb-10">
        <div className="flex flex-col">
          <h2 className="text-2xl font-[900] text-[#1C1C1E] tracking-tight">학급 시간표</h2>
          <span className="text-[11px] font-black text-ios-gray uppercase tracking-[0.14em] mt-1.5 ml-0.5 opacity-60">Daily Schedule</span>
        </div>
        <div className="bg-ios-bg p-2.5 rounded-[1.2rem] border border-black/[0.02] flex items-center justify-center text-ios-blue shadow-sm">
          <Calendar className="w-5 h-5 fill-ios-blue/10" />
        </div>
      </div>
      
      <div className="flex-1 space-y-2.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-ios-blue animate-spin" />
            <p className="text-[11px] font-black text-ios-gray uppercase tracking-[0.2em] text-center opacity-70">NEIS Fetching...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <AlertCircle className="w-10 h-10 text-ios-red" />
            <p className="text-xs font-[800] text-ios-red tracking-tight uppercase">데이터 로드 실패</p>
          </div>
        ) : timetable.length > 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((period) => {
              const subject = timetable.find(t => parseInt(t.perio) === period);
              const isActive = activePeriod === period;
              
              return (
                <div 
                  key={period}
                  className={cn(
                    "group flex items-center gap-5 px-6 py-4.5 rounded-[2.2rem] transition-all border duration-500",
                    isActive 
                      ? "bg-[#1C1C1E] text-white border-[#1C1C1E] shadow-[0_15px_40px_rgba(0,0,0,0.2)] scale-[1.03] z-10" 
                      : "bg-ios-bg/50 text-[#1C1C1E] border-transparent hover:border-black/[0.06] hover:bg-white hover:shadow-xl"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center text-[13px] font-[900]",
                    isActive ? "bg-white/10 text-white" : "bg-ios-bg text-ios-gray"
                  )}>
                    {period}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className={cn(
                      "text-base font-[750] tracking-tight flex items-center gap-2.5",
                      !subject && !isActive && "opacity-25"
                    )}>
                      <span className="text-xl leading-none">{getSubjectEmoji(subject?.itrtNm || '')}</span> 
                      {subject?.itrtNm || '자습/기타'}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="flex items-center gap-2 bg-ios-blue px-4 py-1.5 rounded-full shadow-lg shadow-ios-blue/30"
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">진행중</span>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Clock className="w-12 h-12 mb-3 text-[#1C1C1E]" />
            <p className="text-base font-bold text-[#1C1C1E]">수업이 없는 날입니다</p>
            <p className="text-[10px] mt-1 font-black text-ios-gray uppercase tracking-widest">Happy Weekend</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-[#86868B] opacity-60">
         <span>Real-time Schedule</span>
         <span className="text-ios-blue">NEIS Open API</span>
      </div>
    </motion.div>
  );
}
