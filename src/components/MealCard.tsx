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
    <div className="ios-card flex flex-col h-full bg-white relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-[#1C1C1E] tracking-tight">오늘의 급식</h2>
          <span className="text-[9px] font-black text-ios-gray uppercase tracking-widest opacity-60">Dining Menu</span>
        </div>
        <div className="flex bg-ios-bg p-1 rounded-2xl border border-black/[0.01]">
          {['중식', '석식'].map((type) => (
            <button 
              key={type}
              onClick={() => setActiveType(type as '중식' | '석식')}
              className={cn(
                "px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all",
                activeType === type ? "bg-white shadow-sm text-ios-blue" : "text-ios-gray"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center min-h-[220px]">
        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="w-6 h-6 text-ios-blue animate-spin opacity-40" />
            <p className="text-[9px] font-bold text-ios-gray uppercase tracking-widest">Loading...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-12 gap-2 text-center">
            <AlertCircle className="w-6 h-6 text-ios-red opacity-40" />
            <p className="text-[10px] font-bold text-ios-red uppercase tracking-tight">Link Failed</p>
          </div>
        ) : activeMeal ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeType + (showNutrition ? '-nut' : '-menu')}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-4"
            >
              {!showNutrition ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <span className="text-[9px] font-bold text-ios-blue bg-ios-blue/5 px-2.5 py-1 rounded-lg uppercase tracking-tight">
                      {activeMeal.calorie}
                    </span>
                  </div>
                  <div className="px-4 py-8 bg-ios-bg/30 rounded-[2rem] border border-black/[0.01] flex items-center justify-center">
                    <p className="text-sm font-bold leading-relaxed text-center text-[#1C1C1E] opacity-90">
                      {activeMeal.menu.slice(0, 2).join(' • ')}<br/>
                      <span className="text-ios-blue font-black underline decoration-[2px] underline-offset-4">
                        {activeMeal.menu[2] || '추천 메뉴'}
                      </span><br/>
                      {activeMeal.menu.slice(3).join(' • ')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '탄수화물', key: '탄수화물', color: 'bg-ios-orange/5 text-ios-orange' },
                    { label: '단백질', key: '단백질', color: 'bg-ios-red/5 text-ios-red' },
                    { label: '지방', key: '지방', color: 'bg-yellow-500/5 text-yellow-600' },
                    { label: '에너지', key: '에너지', color: 'bg-ios-green/5 text-ios-green' }
                  ].map(nut => (
                    <div key={nut.key} className={cn("p-4 rounded-[1.5rem] flex flex-col items-center justify-center gap-1", nut.color)}>
                      <span className="text-[8px] font-bold uppercase opacity-60">{nut.label}</span>
                      <span className="text-xs font-black">{getNutritionValue(nut.key)}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center py-12 text-center opacity-30">
            <Utensils className="w-6 h-6 mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No Menu Today</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-black/[0.03] flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-ios-gray">
         <span>Health Engine</span>
         <button 
           onClick={() => setShowNutrition(!showNutrition)}
           className="text-ios-blue"
         >
           {showNutrition ? 'Menu' : 'Nutrition Details'}
         </button>
      </div>
    </div>
  );
}
