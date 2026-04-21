import { useState, useEffect } from 'react';
import { Utensils, Loader2, AlertCircle, Sun, Moon, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchDailyMeals, type MealInfo } from '@/src/lib/neis';
import { cn } from '@/src/lib/utils';

export default function MealCard() {
  const [meals, setMeals] = useState<MealInfo[]>([]);
  const [activeType, setActiveType] = useState<'중식' | '석식'>('석식');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);

  useEffect(() => {
    async function loadMeals() {
      try {
        setLoading(true);
        const data = await fetchDailyMeals();
        setMeals(data);
        
        // Default to dinner if available, otherwise switch to lunch
        const hasDinner = data.find(m => m.type === '석식');
        if (!hasDinner && data.find(m => m.type === '중식')) {
          setActiveType('중식');
        }
        setError(false);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadMeals();
  }, []);

  const activeMeal = meals.find(m => m.type === activeType);

  // Parse core nutrition values from strings like "탄수화물(g) : 112.4"
  const getNutritionValue = (label: string) => {
    const item = activeMeal?.nutrition?.find(n => n.includes(label));
    if (!item) return '-';
    return item.split(':')[1]?.trim() || '-';
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="ios-card flex flex-col h-full min-h-[500px] bg-white border-black/[0.01]"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-[900] text-[#1C1C1E] tracking-tight">오늘의 급식</h2>
            <button 
              onClick={() => setShowNutrition(!showNutrition)}
              className={cn(
                "p-2 rounded-xl transition-all active:scale-90",
                showNutrition ? "bg-ios-blue text-white shadow-lg shadow-ios-blue/20" : "bg-ios-bg text-ios-gray hover:bg-gray-200"
              )}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[11px] font-black text-ios-gray uppercase tracking-[0.14em] mt-1.5 ml-0.5 opacity-60">Dining Menu</span>
        </div>
        <div className="flex bg-ios-bg p-1.5 rounded-[1.6rem] border border-black/[0.02]">
          <button 
            onClick={() => setActiveType('중식')}
            className={cn(
              "px-4 py-2 text-[11px] font-black rounded-[1.2rem] transition-all flex items-center gap-2",
              activeType === '중식' ? "bg-white shadow-md text-ios-blue" : "text-ios-gray hover:text-black"
            )}
          >
            <Sun className="w-4 h-4" /> 중식
          </button>
          <button 
            onClick={() => setActiveType('석식')}
            className={cn(
              "px-4 py-2 text-[11px] font-black rounded-[1.2rem] transition-all flex items-center gap-2",
              activeType === '석식' ? "bg-white shadow-md text-ios-blue" : "text-ios-gray hover:text-black"
            )}
          >
            <Moon className="w-4 h-4" /> 석식
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-ios-blue animate-spin" />
            <p className="text-[10px] font-black text-ios-gray uppercase tracking-widest">Real-time Fetching...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-ios-red" />
            <p className="text-xs font-bold text-ios-red tracking-tight">서비스 연결에 실패했습니다</p>
          </div>
        ) : activeMeal ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType + (showNutrition ? '-nut' : '-menu')}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              {!showNutrition ? (
                <>
                  <div className="flex justify-center">
                    <span className="text-[10px] font-black text-ios-blue bg-ios-blue/10 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                      {activeMeal.calorie}
                    </span>
                  </div>
                  <div className="p-8 bg-ios-bg rounded-[2.5rem] border border-black/[0.02] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] min-h-[160px] flex items-center justify-center">
                    <p className="text-base font-bold leading-relaxed text-center text-[#1C1C1E]">
                      {activeMeal.menu.slice(0, 2).join(' • ')}<br/>
                      <span className="text-ios-blue font-black underline underline-offset-8 decoration-[3px]">
                        {activeMeal.menu[2] || '추천 메뉴'}
                      </span><br/>
                      {activeMeal.menu.slice(3).join(' • ')}
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-ios-gray uppercase tracking-widest text-center mb-4">Detailed Nutrition Facts</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: '탄수화물', key: '탄수화물', color: 'bg-ios-orange/5 text-ios-orange border-ios-orange/10' },
                      { label: '단백질', key: '단백질', color: 'bg-ios-red/5 text-ios-red border-ios-red/10' },
                      { label: '지방', key: '지방', color: 'bg-yellow-500/5 text-yellow-600 border-yellow-500/10' },
                      { label: '에너지(kcal)', key: '에너지', color: 'bg-ios-green/5 text-ios-green border-ios-green/10' }
                    ].map(nut => (
                      <div key={nut.key} className={cn("p-4 rounded-3xl border flex flex-col items-center justify-center gap-1", nut.color)}>
                        <span className="text-[10px] font-black uppercase opacity-60 tracking-tighter">{nut.label}</span>
                        <span className="text-sm font-black">{getNutritionValue(nut.key)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-ios-bg p-4 rounded-3xl text-[9px] font-bold text-ios-gray leading-tight max-h-[80px] overflow-y-auto no-scrollbar border border-black/[0.02]">
                    {activeMeal.nutrition?.join(' • ') || '영양 상세 정보가 없습니다.'}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Utensils className="w-8 h-8 mb-2" />
            <p className="text-sm font-bold">오늘은 급식 정보가 없습니다.</p>
            <p className="text-[10px] mt-1 uppercase tracking-widest">Weekend / Holiday</p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#86868B]">
         <span>IE Health Engine</span>
         <button 
           onClick={() => setShowNutrition(!showNutrition)}
           className="text-[#0071E3] hover:underline"
         >
           {showNutrition ? 'Show Menu' : 'Detailed Nutrition'}
         </button>
      </div>
    </motion.div>
  );
}
