import { motion } from 'motion/react';
import { Book, Info, Sparkles } from 'lucide-react';
import { getDailyContent } from '@/src/lib/dailyContent';

export default function DailyIdiomCard() {
  const { idiom } = getDailyContent();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="ios-card bg-white border-black/[0.03] overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-ios-blue text-white rounded-2xl shadow-lg shadow-ios-blue/10">
            <Book className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-[#1C1C1E]">오늘의 고사성어</h3>
            <p className="text-[10px] font-bold text-ios-gray uppercase tracking-widest">Daily Wisdom</p>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-ios-orange animate-pulse" />
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className="text-5xl font-black text-[#1C1C1E] tracking-widest bg-ios-bg p-8 rounded-[2.5rem] border border-black/[0.02]">
            {idiom.word}
          </div>
          <div className="text-xl font-black text-ios-blue tracking-tighter">
            {idiom.korean}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-ios-blue rounded-full" />
              <span className="text-xs font-black text-ios-gray uppercase tracking-widest">뜻풀이</span>
            </div>
            <p className="text-base font-bold text-[#1C1C1E] leading-relaxed">
              {idiom.meaning}
            </p>
          </div>

          <div className="p-5 bg-ios-bg rounded-2xl border border-black/[0.02] relative group">
            <div className="absolute -top-3 left-4 bg-white px-3 py-1 rounded-full border border-black/[0.05] flex items-center gap-1">
              <Info className="w-3 h-3 text-ios-gray" />
              <span className="text-[9px] font-black text-ios-gray uppercase tracking-wider">유래와 배경</span>
            </div>
            <p className="text-sm font-medium text-ios-gray leading-relaxed pt-1">
              {idiom.origin}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
