import { useState, useEffect } from 'react';
import { Bell, Timer, Flame, X, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface PresidentBannerProps {
  message: string;
}

export default function PresidentBanner({ message }: PresidentBannerProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  useEffect(() => {
    const midtermDate = new Date('2026-04-27T00:00:00+09:00');
    const timer = setInterval(() => {
      const now = new Date();
      const diff = midtermDate.getTime() - now.getTime();
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Minimal Message Banner */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 flex items-center gap-4 shadow-sm border border-black/[0.01]">
          <div className="w-10 h-10 bg-ios-blue/5 text-ios-blue rounded-2xl flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black text-ios-gray uppercase tracking-widest mb-0.5 opacity-60">안내사항</p>
            <p className="text-sm font-bold text-[#1C1C1E] leading-snug tracking-tight">
              {message}
            </p>
          </div>
        </div>
        
        {/* High-End Countdown Badge */}
        <button 
          onClick={() => setShowDetail(true)}
          className="bg-[#1C1C1E] p-6 rounded-3xl shadow-lg w-full flex items-center justify-between active:scale-[0.98] transition-all group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-ios-red/10 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="text-[9px] font-black text-ios-gray uppercase tracking-widest mb-1 flex items-center gap-1.5">
              중간고사 <div className="w-1 h-1 bg-ios-red rounded-full animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tighter tabular-nums">D-{timeLeft.days}</span>
              <span className="text-[11px] font-medium text-ios-gray/80 font-mono tracking-tighter">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="relative z-10 w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
             <Flame className="w-5 h-5 text-ios-red opacity-80" />
          </div>
        </button>
      </div>

      {/* Countdown Detail Overlay */}
      <AnimatePresence>
        {showDetail && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.98, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="w-full max-w-sm bg-white/95 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col items-center p-8 relative border border-white"
            >
              <button 
                onClick={() => setShowDetail(false)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-ios-bg flex items-center justify-center text-ios-gray hover:text-black transition-all active:scale-90"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 bg-ios-red/10 text-ios-red rounded-2xl flex items-center justify-center mb-4">
                  <Flame className="w-6 h-6 fill-ios-red/10" />
                </div>
                <h3 className="text-xl font-[800] tracking-tight text-[#1C1C1E]">1학기 중간고사</h3>
                <span className="text-[10px] font-bold text-ios-gray uppercase tracking-[0.1em] mt-1 opacity-60">Academic Journey</span>
              </div>

              {/* Minimal Horizontal Countdown */}
              <div className="w-full flex justify-between items-center bg-ios-bg/50 rounded-3xl p-5 mb-8 border border-black/[0.02]">
                {[
                  { label: '일', val: timeLeft.days, color: 'text-ios-red' },
                  { label: '시', val: timeLeft.hours, color: 'text-[#1C1C1E]' },
                  { label: '분', val: timeLeft.minutes, color: 'text-[#1C1C1E]' },
                  { label: '초', val: timeLeft.seconds, color: 'text-[#1C1C1E]' },
                ].map((item, i, arr) => (
                  <div key={i} className="flex flex-1 items-center justify-center relative">
                    <div className="flex flex-col items-center">
                      <span className={cn("text-3xl font-[900] tracking-tighter tabular-nums", item.color)}>
                        {String(item.val).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-black text-ios-gray uppercase mt-0.5">{item.label}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-4 bg-black/5" />
                    )}
                  </div>
                ))}
              </div>

              <div className="w-full text-center px-2">
                 <p className="text-sm font-[700] leading-[1.5] tracking-tight text-[#1C1C1E] opacity-90">
                   "후회 없는 하루를 보내세요.<br/>
                   당신의 노력을 응원합니다."
                 </p>
              </div>

              <div className="mt-8 pt-6 border-t border-black/5 w-full flex justify-center">
                <button 
                  onClick={() => setShowDetail(false)}
                  className="text-ios-blue text-[11px] font-black uppercase tracking-widest active:opacity-50 transition-opacity"
                >
                  공부하러 가기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
