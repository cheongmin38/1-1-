import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Target, BookOpen, Clock, ChevronRight, LogOut, Sparkles, Award, Settings, Trash2, Lock } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

import { STUDENT_LIST } from '@/src/constants/students';

interface StudyPlan {
  id: string;
  subject: string;
  goal: string;
  plan: any;
  createdAt: any;
}

export default function StudentProfile({ viewingId }: { viewingId?: string | null }) {
  const myId = localStorage.getItem('student_id') || '0';
  const myName = localStorage.getItem('student_name') || '친구';
  const studentRole = localStorage.getItem('student_role') || 'student';

  const isViewingOthers = !!viewingId && viewingId !== myId;
  const targetId = viewingId || myId;
  const targetName = isViewingOthers 
    ? (STUDENT_LIST[parseInt(targetId)]?.name || '학생')
    : myName;

  const [personalGoal, setPersonalGoal] = useState('');
  const [profileName, setProfileName] = useState(targetName);
  const [teacherPassword, setTeacherPassword] = useState('0000');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [savedPlans, setSavedPlans] = useState<StudyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  useEffect(() => {
    // Sync profile name when target changes
    setProfileName(targetName);
    
    // Load personal goal from profile
    const profileRef = doc(db, 'profiles', targetId);
    const unsubscribeProfile = onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        setPersonalGoal(doc.data().personalGoal || '');
      } else {
        setPersonalGoal('');
      }
    });

    // Load teacher auth code if teacher and viewing self
    if (studentRole === 'teacher' && !isViewingOthers) {
      const authRef = doc(db, 'config', 'teacher_auth');
      const unsubscribeAuth = onSnapshot(authRef, (doc) => {
        if (doc.exists()) {
          setTeacherPassword(doc.data().password || '0000');
        }
      });
      return () => {
        unsubscribeProfile();
        unsubscribeAuth();
      };
    }

    // Load saved plans
    const q = query(
      collection(db, 'study_plans'),
      where('studentId', '==', targetId),
      orderBy('createdAt', 'desc')
    );
    const unsubscribePlans = onSnapshot(q, (snapshot) => {
      const plans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudyPlan[];
      setSavedPlans(plans);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading plans:", error);
      setSavedPlans([]);
      setIsLoading(false);
    });

    return () => {
      unsubscribeProfile();
      unsubscribePlans();
    };
  }, [targetId, targetName, isViewingOthers, studentRole]);

  const handleUpdatePassword = async () => {
    if (isViewingOthers) return;
    if (teacherPassword.length < 4) {
      alert('비밀번호는 4자리 이상이어야 해!');
      return;
    }
    try {
      await setDoc(doc(db, 'config', 'teacher_auth'), {
        password: teacherPassword,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsEditingPassword(false);
      alert('비밀번호가 성공적으로 변경되었습니다. 다음 로그인부터는 새 비밀번호를 사용해주세요!');
    } catch (err) {
      console.error(err);
      alert('비밀번호 저장 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await setDoc(doc(db, 'profiles', myId), {
        studentId: myId,
        name: profileName,
        updatedAt: serverTimestamp()
      }, { merge: true });
      localStorage.setItem('student_name', profileName);
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
      alert('프로필 저장 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateGoal = async () => {
    try {
      await setDoc(doc(db, 'profiles', myId), {
        studentId: myId,
        name: myName,
        personalGoal,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setIsEditingGoal(false);
    } catch (err) {
      console.error(err);
      alert('목표 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('이 학습 계획을 삭제할까요?')) return;
    try {
      await deleteDoc(doc(db, 'study_plans', id));
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('classmate_auth');
    localStorage.removeItem('student_id');
    localStorage.removeItem('student_name');
    localStorage.removeItem('student_role');
    window.location.href = '/'; // More direct than reload in some environments
  };

  return (
    <div className="flex flex-col gap-8 pb-32 relative">
      {/* Header Profile Section */}
      <div className="ios-card-premium bg-white border border-black/[0.03] shadow-xl flex flex-col sm:flex-row items-center gap-8 py-10 px-10 relative">
        <button 
          onClick={handleLogout}
          className="absolute top-6 right-6 p-4 bg-ios-red/5 text-ios-red rounded-2xl hover:bg-ios-red/10 transition-colors active:scale-95 group z-10"
          title="로그아웃"
        >
          <LogOut className="w-5 h-5" />
        </button>

        <div className="relative">
          <div className="w-24 h-24 bg-ios-bg rounded-[2.5rem] flex items-center justify-center border border-black/[0.05] shadow-inner">
            <User className="w-12 h-12 text-ios-blue" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-ios-green p-2 rounded-2xl text-white shadow-lg border-4 border-white">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
            <>
                <h2 className="text-3xl font-[900] tracking-tight text-[#1C1C1E]">{profileName}</h2>
                {studentRole === 'teacher' && (
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black text-ios-blue bg-ios-blue/5 px-2 py-1 rounded-lg">관리자 권한</span>
                     {isEditingPassword ? (
                       <div className="flex items-center gap-2 bg-ios-orange/5 p-1 rounded-xl border border-ios-orange/10">
                          <input 
                            type="text"
                            value={teacherPassword}
                            onChange={(e) => setTeacherPassword(e.target.value)}
                            placeholder="새 비밀번호"
                            className="text-sm font-black text-ios-orange bg-white rounded-lg px-2 py-1 outline-none w-24"
                            autoFocus
                          />
                          <button onClick={handleUpdatePassword} className="p-1 bg-ios-orange text-white rounded-lg active:scale-90">
                            <Sparkles className="w-3 h-3" />
                          </button>
                          <button onClick={() => setIsEditingPassword(false)} className="p-1 text-ios-gray hover:text-black">
                            <Trash2 className="w-3 h-3" />
                          </button>
                       </div>
                     ) : (
                       <button 
                         onClick={() => setIsEditingPassword(true)}
                         className="flex items-center gap-1.5 px-3 py-1 bg-[#1C1C1E] text-white text-[10px] font-black rounded-lg hover:opacity-90 active:scale-95 transition-all"
                       >
                         <Lock className="w-3 h-3" /> 비밀번호 변경
                       </button>
                     )}
                   </div>
                )}
              </>
            <span className="px-3 py-1 bg-ios-blue/10 text-ios-blue text-[10px] font-black rounded-full uppercase tracking-widest leading-none translate-y-[1px]">
               {targetId === '0' ? '선생님' : `${targetId}번 학생`}
            </span>
          </div>
          <p className="text-ios-gray text-sm font-bold tracking-tight">평택고등학교 1학년 1반</p>
          <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-4">
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-ios-gray uppercase tracking-widest mb-1 opacity-50">저장된 플랜</span>
               <span className="text-xl font-[900] text-[#1C1C1E]">{savedPlans.length}</span>
             </div>
             <div className="w-[1px] h-8 bg-black/[0.05] self-end mb-1" />
             <div className="flex flex-col">
               <span className="text-[10px] font-black text-ios-gray uppercase tracking-widest mb-1 opacity-50">나의 상태</span>
               <span className="text-xl font-[900] text-ios-green">Active</span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Goal Section */}
        <div className="ios-card bg-white border-black/[0.02] flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-ios-orange text-white rounded-2xl shadow-lg shadow-ios-orange/20">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-[#1C1C1E]">나의 이번학기 목표</h3>
                <p className="text-[10px] font-bold text-ios-gray uppercase tracking-widest">Main Academic Goal</p>
              </div>
            </div>
          </div>

          <div className="bg-ios-bg p-6 rounded-[2rem] border border-black/[0.02] min-h-[120px] flex flex-col">
            {isEditingGoal ? (
              <textarea 
                value={personalGoal}
                onChange={(e) => setPersonalGoal(e.target.value)}
                placeholder="나의 공부 목표를 입력해보세요..."
                className="w-full bg-transparent text-sm font-bold text-[#1C1C1E] leading-relaxed resize-none h-32 outline-none"
                autoFocus
              />
            ) : (
              <p className={cn(
                "text-sm font-bold leading-relaxed",
                personalGoal ? "text-[#1C1C1E] italic" : "text-ios-gray opacity-50"
              )}>
                {personalGoal || "아직 설정된 목표가 없습니다. 우측 하단의 편집 버튼을 눌러 목표를 설정해보세요!"}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            {!isViewingOthers && (
              isEditingGoal ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditingGoal(false)}
                    className="px-6 py-3 bg-ios-bg text-ios-gray rounded-xl text-xs font-black uppercase tracking-widest"
                  >
                    취소
                  </button>
                  <button 
                    onClick={handleUpdateGoal}
                    className="px-6 py-3 bg-ios-blue text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-ios-blue/20"
                  >
                    저장하기
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsEditingGoal(true)}
                  className="px-6 py-3 bg-[#1C1C1E] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  <Settings className="w-3.5 h-3.5" />
                  목표 수정
                </button>
              )
            )}
          </div>
        </div>

        {/* Saved Plans Section */}
        <div className="flex flex-col gap-5">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-3">
                 <Sparkles className="w-5 h-5 text-ios-blue" />
                 저장된 AI 학습 플랜
              </h3>
              <span className="text-[10px] font-black text-ios-gray uppercase tracking-widest bg-white px-2 py-1 rounded-lg border border-black/5">
                {savedPlans.length} Total
              </span>
           </div>

           <div className="space-y-4">
             {isLoading ? (
               <div className="ios-card bg-white border-black/[0.01] flex flex-col items-center py-20 opacity-50">
                  <Clock className="w-8 h-8 animate-pulse text-ios-gray mb-4" />
                  <p className="text-xs font-bold text-ios-gray uppercase tracking-widest">Loading Plans...</p>
               </div>
             ) : savedPlans.length > 0 ? (
               savedPlans.map((plan) => (
                 <motion.div 
                   key={plan.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="ios-card bg-white border-black/[0.01] group hover:border-ios-blue/20 transition-all p-6 relative"
                 >
                   <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-ios-blue/10 text-ios-blue rounded-xl flex items-center justify-center">
                         <BookOpen className="w-5 h-5" />
                       </div>
                       <div>
                         <h4 className="text-base font-black text-[#1C1C1E] tracking-tight">{plan.subject} 마스터 플랜</h4>
                         <p className="text-[10px] font-bold text-ios-gray uppercase tracking-widest truncate max-w-[200px]">
                           {plan.createdAt?.toDate ? plan.createdAt.toDate().toLocaleDateString() : '방금 전'} • {plan.goal}
                         </p>
                       </div>
                     </div>
                     <button 
                       onClick={() => handleDeletePlan(plan.id)}
                       className="p-2 text-ios-red/30 hover:text-ios-red hover:bg-ios-red/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                   <div className="flex items-center justify-between pt-4 border-t border-black/[0.03]">
                      <span className="text-[10px] font-black text-ios-blue uppercase tracking-widest">AI Roadmap Ready</span>
                      <button 
                        onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                        className="flex items-center gap-1 text-[10px] font-black text-ios-gray uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                      >
                         {expandedPlanId === plan.id ? '접기' : '자세히 보기'} <ChevronRight className={cn("w-3 h-3 transition-transform", expandedPlanId === plan.id && "rotate-90")} />
                      </button>
                   </div>
                   
                   <AnimatePresence>
                     {expandedPlanId === plan.id && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden"
                       >
                         <div className="pt-6 mt-4 border-t border-black/[0.03] space-y-6">
                            <div className="bg-ios-bg p-4 rounded-2xl italic text-sm font-bold text-[#1C1C1E]">
                               "{plan.plan.summary}"
                            </div>
                            <div className="space-y-4">
                               {plan.plan.steps.map((step: any, sIdx: number) => (
                                 <div key={sIdx} className="flex gap-4">
                                    <div className="w-10 h-10 bg-[#1C1C1E] text-white rounded-xl flex items-center justify-center shrink-0 text-xs font-black">
                                       {step.day}
                                    </div>
                                    <div>
                                       <h5 className="text-sm font-black text-[#1C1C1E] mb-1">{step.focus}</h5>
                                       <ul className="space-y-1">
                                          {step.details.map((detail: string, dIdx: number) => (
                                            <li key={dIdx} className="text-[12px] font-medium text-ios-gray flex items-start gap-2">
                                               <span className="text-ios-blue">•</span>
                                               {detail}
                                            </li>
                                          ))}
                                       </ul>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </motion.div>
               ))
             ) : (
               <div className="ios-card bg-ios-bg/30 border-dashed border-2 border-black/5 flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-xs font-black text-ios-gray uppercase tracking-widest opacity-40">아직 저장된 플랜이 없습니다.</p>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
