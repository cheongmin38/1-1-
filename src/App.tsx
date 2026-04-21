/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, LogOut, Coffee, Info, LayoutDashboard, Utensils, Calendar, Sparkles, User, Bell, ChevronRight, Trophy } from 'lucide-react';
import LoginGate from './components/LoginGate';
import PresidentBanner from './components/PresidentBanner';
import MealCard from './components/MealCard';
import TimetableCard from './components/TimetableCard';
import PlanCalendar from './components/PlanCalendar';
import NoticeSummarizer from './components/NoticeSummarizer';
import DDayCard from './components/DDayCard';
import QuickLinks from './components/QuickLinks';
import TeacherNoticeBoard from './components/TeacherNoticeBoard';
import TeacherControlCenter from './components/TeacherControlCenter';
import { cn } from './lib/utils';

type TabType = 'dashboard' | 'meal' | 'timetable' | 'notice' | 'management';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [presidentMessage] = useState("평택고 1-1 친구들, 내일 수행평가 잊지 말고 준비해오자! 화이팅! 🦅");

  const studentId = localStorage.getItem('student_id') || '0';
  const studentName = localStorage.getItem('student_name') || '친구';
  const studentRole = localStorage.getItem('student_role') || 'student';

  const handleLogout = () => {
    localStorage.removeItem('classmate_auth');
    localStorage.removeItem('student_id');
    localStorage.removeItem('student_name');
    localStorage.removeItem('student_role');
    window.location.reload();
  };

  const getRoleLabel = () => {
    if (studentRole === 'teacher') return '선생님';
    if (studentRole === 'president') return '반장';
    if (studentRole === 'vice') return '부반장';
    return '';
  };

  const todayStr = new Date().toLocaleDateString('ko-KR', { 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  });

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'meal', label: '급식', icon: Utensils },
    { id: 'timetable', label: '시간표', icon: Calendar },
    { id: 'notice', label: '알림장', icon: Bell },
  ] as const;

  const teacherTabs = [
    ...tabs,
    { id: 'management', label: '관리', icon: Settings },
  ] as const;

  const currentTabs = studentRole === 'teacher' ? teacherTabs : tabs;

  return (
    <LoginGate>
      <div className="min-h-screen bg-[#F2F2F7] font-sans text-[#1C1C1E] flex flex-col pb-24">
        
        {/* iOS Style Status Header */}
        <header className="sticky top-0 z-40 bg-[#F2F2F7]/90 backdrop-blur-2xl px-8 pt-16 pb-6">
          <div className="max-w-6xl mx-auto flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[12px] font-extrabold tracking-[0.14em] text-ios-gray uppercase mb-1.5">{todayStr}</span>
              <h1 className="text-4xl sm:text-5xl font-[900] tracking-tight text-[#1C1C1E]">오늘</h1>
            </div>
             <div className="flex items-center gap-4">
               <div className="flex flex-col items-end mr-1">
                 <div className="flex items-center gap-2">
                   {getRoleLabel() && (
                     <span className="text-[10px] font-black text-ios-blue bg-ios-blue/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                       {getRoleLabel()}
                     </span>
                   )}
                   <span className="text-base font-[800] tracking-tight text-[#1C1C1E]">{studentName}</span>
                 </div>
                 <span className="text-[11px] font-bold text-ios-gray tracking-tighter">{studentId}번 • 평택고 1-1</span>
               </div>
               <button 
                  onClick={handleLogout}
                  className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/[0.04] text-[#8E8E93] hover:text-ios-red transition-all active:scale-90"
               >
                 <LogOut className="w-5 h-5" />
               </button>
               <div className="w-[52px] h-[52px] rounded-[1.4rem] bg-gradient-to-br from-ios-blue to-purple-600 flex items-center justify-center shadow-xl shadow-ios-blue/20 p-[1px]">
                  <div className="w-full h-full bg-[#1C1C1E] rounded-[1.35rem] flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 px-4 sm:px-8 pt-4 max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.99 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <div className="flex flex-col gap-6">
                  {/* President Message & D-Day Banner */}
                  <PresidentBanner message={presidentMessage} />

                  {/* Midterm Energy Boost - Iconic Premium Widget */}
                  <div className="ios-card bg-[#1C1C1E] text-white relative overflow-hidden group border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-ios-blue/10 to-purple-500/10 pointer-events-none" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-ios-blue/10 blur-3xl rounded-full" />
                    <div className="relative z-10 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-ios-red animate-pulse" />
                           <span className="text-[10px] font-black tracking-[0.2em] uppercase text-ios-gray">Eagle Spirit Motivation</span>
                        </div>
                        <Sparkles className="w-4 h-4 text-ios-orange" />
                      </div>
                      <h2 className="text-xl md:text-3xl font-[900] italic tracking-tight leading-[1.1] max-w-[90%]">
                        "성공은 최종적인 것이 아니며, 실패는 치명적인 것이 아니다. 중요한 것은 계속해 나가는 용기다."
                      </h2>
                      <div className="mt-2 pt-5 border-t border-white/5 flex justify-between items-center">
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                             <Trophy className="w-3 h-3 text-ios-blue" />
                           </div>
                           <span className="text-[10px] font-bold text-ios-gray uppercase tracking-widest">Winston Churchill • Class 1-1</span>
                         </div>
                         <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest text-ios-blue">
                           Keep Pushing
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* High Intensity Content - Midterm Focus */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <TimetableCard />
                    <MealCard />
                  </div>

                  {/* Info Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                     <div className="col-span-2 md:col-span-1 h-full"> <DDayCard /> </div>
                     <div className="col-span-2 md:col-span-2"> <NoticeSummarizer /> </div>
                  </div>

                  {/* Location & Weather Mini */}
                  <div className="ios-card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">🌤️</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight">평택시 합정동</span>
                        <span className="text-[11px] font-bold text-ios-gray uppercase tracking-widest">청명함 • 18°C</span>
                      </div>
                    </div>
                    <div className="bg-[#F2F2F7] px-4 py-2 rounded-2xl flex flex-col items-center">
                        <span className="text-[10px] font-black text-ios-gray uppercase tracking-widest">습도</span>
                        <span className="text-xs font-black">45%</span>
                    </div>
                  </div>

                  <QuickLinks />
                </div>
              )}
              
              {activeTab === 'meal' && (
                <div className="max-w-2xl mx-auto flex flex-col gap-6">
                  <h2 className="text-2xl font-black tracking-tight mb-2 px-2">오늘의 메뉴</h2>
                  <MealCard />
                  <div className="ios-card bg-ios-blue/5 border-ios-blue/10">
                    <p className="text-xs font-bold text-ios-blue leading-relaxed">
                      💡 급식 메뉴는 나이스 오픈 API를 통해 실시간으로 제공됩니다. 알러지 유발 식품 번호는 평고 친구들의 가독성을 위해 제거되었습니다.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'timetable' && (
                <div className="max-w-2xl mx-auto flex flex-col gap-8 pb-10">
                  <div className="flex flex-col gap-4">
                    <h2 className="text-2xl font-black tracking-tight px-2">오늘의 시간표</h2>
                    <TimetableCard />
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                       <h2 className="text-2xl font-black tracking-tight">학급 일정 달력</h2>
                       <div className="text-[10px] font-black text-ios-gray bg-white px-2 py-1 rounded-lg border border-black/5 uppercase tracking-widest">Plan & Events</div>
                    </div>
                    <PlanCalendar />
                  </div>

                  <div className="ios-card border-dashed border-2 border-[#8E8E93]/20 flex items-center gap-4 text-[#8E8E93]">
                    <div className="p-3 bg-gray-100 rounded-2xl"> <Info className="w-5 h-5" /> </div>
                    <p className="text-xs font-medium italic">이 시스템은 우리 반의 소중한 일정을 함께 관리하기 위해 제작되었습니다.</p>
                  </div>
                </div>
              )}

              {activeTab === 'notice' && (
                <div className="max-w-2xl mx-auto flex flex-col gap-6">
                  <TeacherNoticeBoard />
                  <div className="mt-6 border-t border-black/5 pt-8">
                    <h2 className="text-2xl font-black tracking-tight mb-2 px-2">AI 알림 요약</h2>
                    <NoticeSummarizer />
                  </div>
                </div>
              )}

              {activeTab === 'management' && studentRole === 'teacher' && (
                <div className="max-w-3xl mx-auto w-full">
                  <TeacherControlCenter />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* iOS Floating Bottom Navigation Bar */}
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg">
          <div className="apple-tab-bar py-3 px-3 rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.18)] flex justify-between items-center">
            {currentTabs.map((tab) => {
               const isActive = activeTab === tab.id;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as TabType)}
                   className="relative flex flex-col items-center justify-center flex-1 transition-all h-[52px]"
                 >
                   <AnimatePresence>
                     {isActive && (
                       <motion.div
                         layoutId="nav-pill"
                         className="absolute inset-x-1 inset-y-0.5 bg-ios-bg/60 rounded-full -z-10"
                         transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                       />
                     )}
                   </AnimatePresence>
                   <div className={cn(
                     "p-1.5 rounded-2xl mb-0.5 transition-all duration-500",
                     isActive ? "text-ios-blue scale-110" : "text-[#8E8E93]"
                   )}>
                     <tab.icon className={cn("w-6 h-6 transition-all", isActive && "fill-ios-blue/15")} />
                   </div>
                   <span className={cn(
                     "text-[9px] font-extrabold uppercase tracking-[0.18em] transition-all duration-500",
                     isActive ? "text-ios-blue opacity-100" : "text-[#8E8E93] opacity-60"
                   )}>
                     {tab.label}
                   </span>
                 </button>
               );
            })}
          </div>
        </nav>

        {/* Footer Area */}
        <footer className="mt-8 px-12 py-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-[900] tracking-tighter opacity-10">PYEONGTAEK HS 1-1</h2>
          </div>
          <p className="text-[10px] font-bold text-[#8E8E93] tracking-widest uppercase">© 2026 Class Management System • Ver 2.0.0 (iOS Release)</p>
        </footer>
      </div>
    </LoginGate>
  );
}
