import { useState, useEffect } from 'react';
import { Bell, Timer, Flame, X, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
      <div className="w-full bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-6 shadow-sm flex flex-col md:flex-row items-center gap-5">
        <div className="flex items-center gap-4 flex-1 w-full">
          <div className="bg-ios-blue text-white p-3 rounded-2xl shadow-xl shadow-ios-blue/20 shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] font-black text-ios-gray uppercase tracking-widest mb-1">반장 한마디</p>
            <div className="relative group text-sm font-bold text-[#1C1C1E] leading-relaxed">
              📢 {message}
            </div>
          </div>
        </div>
        
        {/* High Energy Midterm Box - Iconic Modern UI */}
        <button 
          onClick={() => setShowDetail(true)}
          className="flex items-center gap-4 bg-gradient-to-br from-ios-red to-[#FF2D55] p-5 rounded-[2rem] shadow-xl shadow-ios-red/30 w-full md:w-auto relative overflow-hidden active:scale-[0.97] transition-all group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 -rotate-12 translate-x-3 -translate-y-2 group-hover:rotate-0 transition-transform duration-700">
             <Trophy className="w-20 h-20 text-white" />
          </div>
          <div className="bg-white/20 backdrop-blur-md text-white p-2.5 rounded-2xl flex items-center justify-center relative z-10">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div className="relative z-10 flex flex-col items-start pr-4">
            <p className="text-[10px] font-black text-white/70 uppercase tracking-widest leading-none mb-1.5 flex items-center gap-1.5">
              중간고사 카운트다운 <Sparkles className="w-2 h-2" />
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tighter leading-none">D-{timeLeft.days}</span>
              <div className="flex items-center gap-1 font-mono text-white/90 text-[11px] font-extrabold translate-y-[-1px]">
                <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span className="opacity-40">:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
              </div>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[#F2F2F7] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col items-center p-10 relative"
            >
              <button 
                onClick={() => setShowDetail(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md text-ios-gray"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="bg-ios-red text-white p-6 rounded-[2.5rem] shadow-2xl shadow-ios-red/20 mb-8 animate-bounce">
                <Trophy className="w-12 h-12" />
              </div>

              <h2 className="text-3xl font-black tracking-tighter text-[#1C1C1E] mb-2">1학기 중간고사</h2>
              <p className="text-ios-gray text-xs font-black uppercase tracking-widest mb-10 italic font-display">Let's fly, Pyeongtaek Eagle 🦅</p>

              <div className="grid grid-cols-4 gap-4 w-full mb-10">
                {[
                  { label: 'Days', val: timeLeft.days },
                  { label: 'Hours', val: timeLeft.hours },
                  { label: 'Minutes', val: timeLeft.minutes },
                  { label: 'Seconds', val: timeLeft.seconds },
                ].map((item, i) => (
                  <div key={i} className="bg-white p-5 rounded-[2rem] shadow-sm border border-black/[0.02] flex flex-col items-center">
                    <span className="text-4xl font-black text-ios-red tracking-tighter mb-1">
                      {String(item.val).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-black text-ios-gray uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="w-full bg-[#1C1C1E] p-8 rounded-[2.5rem] text-white flex flex-col items-center text-center gap-4 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-ios-red/10 scale-0 group-hover:scale-150 transition-transform duration-1000 -z-10" />
                 <Sparkles className="w-6 h-6 text-ios-orange animate-pulse" />
                 <p className="text-lg font-bold leading-tight">
                   "포기하지 마라. <br/>
                   지금 흘린 땀방울은 배신하지 않는다."
                 </p>
                 <div className="mt-4 bg-white/10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                   Class 1-1 Fighting Spirit
                 </div>
              </div>

              <button 
                onClick={() => setShowDetail(false)}
                className="mt-8 text-ios-blue text-xs font-black uppercase tracking-widest hover:underline"
              >
                닫고 공부하러 가기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
