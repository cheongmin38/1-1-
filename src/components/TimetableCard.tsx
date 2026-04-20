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
      className="ios-card flex flex-col h-full min-h-[400px] bg-white border-black/[0.02]"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-[#1C1C1E] tracking-tight">학급 시간표</h2>
          <span className="text-[10px] font-black text-ios-gray uppercase tracking-widest leading-none mt-0.5">Daily Schedule</span>
        </div>
        <div className="bg-ios-bg px-3 py-2 rounded-2xl border border-black/[0.02] flex items-center gap-2.5 text-ios-blue">
          <Calendar className="w-4 h-4" />
          <span className="text-[10px] font-black tracking-widest uppercase">1-1 Focus</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-ios-blue animate-spin" />
            <p className="text-[10px] font-black text-ios-gray uppercase tracking-widest text-center">정보를 가져오는 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-ios-red" />
            <p className="text-[10px] font-black text-ios-red tracking-tight uppercase">데이터 로드에<br/>실패했습니다.</p>
          </div>
        ) : timetable.length > 0 ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5, 6, 7].map((period) => {
              const subject = timetable.find(t => parseInt(t.perio) === period);
              const isActive = activePeriod === period;
              
              return (
                <div 
                  key={period}
                  className={cn(
                    "group flex items-center gap-4 px-5 py-3.5 rounded-3xl transition-all border",
                    isActive 
                      ? "bg-ios-blue text-white border-ios-blue shadow-[0_10px_25px_rgba(0,122,255,0.25)] scale-[1.02]" 
                      : "bg-ios-bg/40 text-[#1C1C1E] border-transparent hover:border-black/[0.05] hover:bg-white hover:shadow-lg"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-2xl flex items-center justify-center text-[12px] font-black",
                    isActive ? "bg-white/20 text-white" : "bg-ios-bg text-ios-gray"
                  )}>
                    {period}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className={cn(
                      "text-sm font-bold tracking-tight flex items-center gap-2",
                      !subject && !isActive && "opacity-30"
                    )}>
                      <span className="text-lg leading-none">{getSubjectEmoji(subject?.itrtNm || '')}</span> 
                      {subject?.itrtNm || '자습/기타'}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full"
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white">ON AIR</span>
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

      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#86868B]">
         <span>Real-time Schedule</span>
         <span className="text-[#0071E3]">NEIS Open API</span>
      </div>
    </motion.div>
  );
}
