import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, Loader2, ChevronRight, Target, BookOpen, BarChart3, Clock, CheckCircle2, Save, Download } from 'lucide-react';
import { Type } from "@google/genai";
import { ai } from '@/src/lib/gemini';
import { cn } from '@/src/lib/utils';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface StudyPlanStep {
  day: string;
  focus: string;
  details: string[];
}

interface GeneratedPlan {
  title: string;
  summary: string;
  steps: StudyPlanStep[];
  tips: string[];
}

export default function AIStudyPlanner() {
  const studentId = localStorage.getItem('student_id') || '0';
  const [subject, setSubject] = useState('');
  const [currentLevel, setCurrentLevel] = useState('middle');
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);

  const savePlan = async () => {
    if (!plan || isSaving) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'study_plans'), {
        studentId,
        subject,
        goal,
        level: currentLevel,
        plan,
        createdAt: serverTimestamp()
      });
      alert('학습 계획이 프로필에 저장되었습니다!');
    } catch (err) {
      console.error(err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const generatePlan = async () => {
    if (!subject.trim() || !goal.trim() || isGenerating) return;

    setIsGenerating(true);
    setPlan(null);

    const prompt = `
      학생의 과목별 목표 달성을 위한 세세한 AI 학습 계획을 세워줘.
      과목: ${subject}
      현재 수준/상태: ${currentLevel}
      목표: ${goal}

      다음 JSON 형식으로 응답해줘:
      {
        "title": "계획 제목",
        "summary": "전체 요약 및 격려 메시지",
        "steps": [
          { "day": "1일차", "focus": "학습 주제", "details": ["디테일1", "디테일2"] }
        ],
        "tips": ["학습 팁1", "학습 팁2"]
      }
      한글로 작성해주고, 학생에게 실질적인 도움이 되도록 매우 구체적으로 작성해줘.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    details: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    }
                  }
                }
              },
              tips: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "summary", "steps", "tips"]
          }
        }
      });

      if (!response.text) {
        throw new Error("Empty response from AI");
      }

      const result = JSON.parse(response.text);
      setPlan(result);
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("학습 계획 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Hero Section */}
      <div className="ios-card-premium bg-ios-blue text-white overflow-hidden shadow-2xl shadow-ios-blue/20">
        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 translate-x-4 -translate-y-4">
          <Brain className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
             <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
               <Sparkles className="w-5 h-5 text-white" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">AI Enhanced Learning</span>
          </div>
          <h2 className="text-3xl font-[900] tracking-tight mb-2">맞춤형 학습 플래너</h2>
          <p className="text-white/80 text-sm font-medium max-w-md leading-relaxed">
            나의 목표와 현재 상태를 입력하면,<br/>
            Gemini AI가 과목별 맞춤형 공부 계획을 세세하게 짜드립니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input Form */}
        <div className="ios-card bg-white border-black/[0.01] flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-ios-gray uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> 과목 선택
              </label>
              <input 
                type="text" 
                placeholder="예: 수학, 국어, 영어 등"
                className="w-full bg-ios-bg px-6 py-4 rounded-2xl text-sm font-black border-none focus:ring-2 focus:ring-ios-blue/20 transition-all outline-none"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-ios-gray uppercase tracking-widest flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> 나의 현재 상태
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low', label: '취약함', color: 'text-ios-red' },
                  { id: 'middle', label: '보통', color: 'text-ios-blue' },
                  { id: 'high', label: '자신있음', color: 'text-ios-green' }
                ].map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setCurrentLevel(level.id)}
                    className={cn(
                      "py-3 rounded-xl text-xs font-black transition-all border",
                      currentLevel === level.id 
                        ? cn("bg-white shadow-md border-transparent", level.color)
                        : "bg-ios-bg text-ios-gray border-transparent hover:bg-gray-200"
                    )}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-ios-gray uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4" /> 구체적인 목표
              </label>
              <textarea 
                placeholder="예: 중간고사 1등급, 교과서 3회독, 블랙라벨 1단원 마스터 등"
                className="w-full bg-ios-bg px-6 py-4 rounded-2xl text-sm font-black border-none focus:ring-2 focus:ring-ios-blue/20 transition-all outline-none h-32 resize-none"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
          </div>

          <button 
            onClick={generatePlan}
            disabled={!subject.trim() || !goal.trim() || isGenerating}
            className="w-full py-5 bg-[#1C1C1E] text-white rounded-[1.8rem] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI가 계획을 세우는 중...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                AI 학습 플랜 생성하기
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {!plan && !isGenerating ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ios-card bg-ios-bg/30 border-dashed border-2 border-black/5 flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <Clock className="w-8 h-8 text-ios-gray opacity-20" />
                </div>
                <p className="text-sm font-black text-ios-gray uppercase tracking-widest">목표를 입력해주세요</p>
                <p className="text-[10px] font-medium text-ios-gray mt-2 opacity-50">AI가 당신의 학습 파트너가 되어 드립니다.</p>
              </motion.div>
            ) : isGenerating ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ios-card bg-white border-black/[0.01] flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="relative">
                   <Loader2 className="w-16 h-16 text-ios-blue animate-spin" />
                   <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-ios-blue animate-pulse" />
                </div>
                <p className="text-base font-[900] text-[#1C1C1E] mt-8 tracking-tighter">Gemini가 최적의 로드맵을 설계 중입니다...</p>
                <div className="flex gap-1 mt-3">
                  {[0, 1, 2].map((i) => (
                    <motion.div 
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 bg-ios-blue rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            ) : plan ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col gap-6"
              >
                {/* Plan Info */}
                <div className="ios-card bg-white border-black/[0.01]">
                   <div className="flex items-start justify-between mb-4">
                      <div className="flex flex-col">
                        <h3 className="text-xs font-black text-ios-blue uppercase tracking-[0.2em] mb-2">AI Generated Roadmap</h3>
                        <h2 className="text-2xl font-[900] tracking-tight text-[#1C1C1E]">{plan.title}</h2>
                      </div>
                      <button 
                        onClick={savePlan}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-3 bg-ios-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-ios-blue/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        프로필에 저장
                      </button>
                   </div>
                   <div className="p-6 bg-ios-bg rounded-[2rem] border border-black/[0.02]">
                      <p className="text-sm font-[700] text-[#1C1C1E] leading-relaxed italic">
                        "{plan.summary}"
                      </p>
                   </div>
                </div>

                {/* Steps */}
                <div className="flex flex-col gap-4">
                  {plan.steps.map((step, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="ios-card bg-white border-black/[0.01] group hover:border-ios-blue/20 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#1C1C1E] text-white rounded-2xl flex items-center justify-center shrink-0 text-sm font-black shadow-lg shadow-black/10">
                          {step.day}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-[900] text-[#1C1C1E] mb-2 flex items-center gap-2">
                             {step.focus}
                             <ChevronRight className="w-4 h-4 text-ios-gray opacity-30 group-hover:translate-x-1 transition-transform" />
                          </h4>
                          <ul className="space-y-1.5">
                            {step.details.map((detail, dIdx) => (
                              <li key={dIdx} className="flex items-start gap-2 text-sm font-medium text-ios-gray">
                                <span className="text-ios-blue mt-1 shrink-0">•</span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Tips */}
                <div className="ios-card bg-[#1C1C1E] text-white overflow-hidden shadow-2xl">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="bg-white/10 p-2 rounded-xl border border-white/5">
                        <Sparkles className="w-5 h-5 text-ios-orange" />
                      </div>
                      <h3 className="text-lg font-black tracking-tight">AI 핵심 공부 팁</h3>
                   </div>
                   <div className="space-y-4">
                     {plan.tips.map((tip, idx) => (
                       <div key={idx} className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                         <div className="w-6 h-6 rounded-full bg-ios-orange/20 flex items-center justify-center shrink-0">
                           <CheckCircle2 className="w-3.5 h-3.5 text-ios-orange" />
                         </div>
                         <p className="text-sm font-bold text-white/90 leading-snug">{tip}</p>
                       </div>
                     ))}
                   </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
