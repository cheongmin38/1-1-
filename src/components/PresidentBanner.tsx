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
      <div className="w-full flex flex-col md:flex-row items-stretch gap-4">
        {/* Minimal Message Banner */}
        <div className="flex-1 bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-7 flex items-center gap-5 shadow-sm">
          <div className="bg-ios-blue/10 text-ios-blue p-3.5 rounded-2xl shrink-0">
            <Bell className="w-6 h-6 fill-ios-blue/10" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-[900] text-ios-gray uppercase tracking-[0.15em] mb-1">반장 한마디</p>
            <p className="text-base font-[700] text-[#1C1C1E] leading-[1.4] tracking-tight">
              {message}
            </p>
          </div>
        </div>
        
        {/* Premium Countdown Badge */}
        <button 
          onClick={() => setShowDetail(true)}
          className="ios-card-premium w-full md:w-[320px] relative overflow-hidden active:scale-[0.98] transition-all group border-black/[0.01]"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 translate-x-4 -translate-y-2 group-hover:rotate-0 transition-transform duration-700">
             <Trophy className="w-24 h-24 text-black" />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex flex-col items-start translate-y-[-1px]">
              <div className="text-[10px] font-[900] text-ios-gray uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                중간고사 <div className="w-1.5 h-1.5 bg-ios-red rounded-full animate-pulse" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-[900] text-[#1C1C1E] tracking-tighter">D-{timeLeft.days}</span>
                <span className="text-[13px] font-mono text-ios-gray font-bold opacity-60">
                  {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center border border-black/[0.03] group-hover:scale-110 transition-transform duration-500">
               <Flame className="w-7 h-7 text-ios-red fill-ios-red/10" />
            </div>
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
