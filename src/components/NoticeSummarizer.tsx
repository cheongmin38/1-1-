import { useState } from 'react';
import { Sparkles, Send, Loader2, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { summarizeNotice } from '@/src/lib/gemini';
import { cn } from '@/src/lib/utils';

export default function NoticeSummarizer() {
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    if (!input.trim() || isLoading) return;
    
    setIsLoading(true);
    setSummary(null);
    try {
      const result = await summarizeNotice(input);
      setSummary(result);
    } catch (err) {
      console.error(err);
      setSummary("⚠️ AI 요약 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="sleek-card p-6 flex flex-col h-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#1D1D1F]">AI 알림장 요약 ✨</h2>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="복잡한 공지사항을 입력하면 3줄로 요약해 드립니다..."
            className="w-full bg-[#F5F5F7] border-none rounded-2xl p-5 text-sm text-[#1D1D1F] font-medium resize-none h-32 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-200 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex-1 min-h-[160px] flex flex-col">
        <AnimatePresence mode="wait">
          {summary ? (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 bg-gradient-to-br from-[#F5F5F7] to-white border border-purple-100 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-purple-50"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-600">
                <Sparkles className="w-12 h-12" />
              </div>
              <p className="text-[10px] font-black text-purple-600 mb-3 tracking-widest uppercase">Gemini AI Intelligence</p>
              <ul className="space-y-3">
                {summary.split('\n').filter(l => l.trim()).map((line, i) => (
                  <li key={i} className="flex gap-3 items-start text-sm font-bold text-[#1D1D1F] leading-snug">
                    <span className="text-purple-500 shrink-0 mt-0.5">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center p-8"
            >
              <p className="text-sm font-bold text-gray-300 text-center">
                위의 입력창에 공지를 넣고<br />아래 버튼을 눌러주세요.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={handleSummarize}
        disabled={!input.trim() || isLoading}
        className={cn(
          "mt-4 w-full py-4 rounded-2xl font-black text-sm tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg",
          input.trim() && !isLoading 
            ? "bg-[#1D1D1F] text-white hover:bg-black active:scale-[0.98] shadow-gray-200" 
            : "bg-gray-100 text-gray-300"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            분석 중...
          </>
        ) : (
          "요약하기"
        )}
      </button>
    </motion.div>
  );
}
