/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, LogOut, Coffee, Info, LayoutDashboard, Utensils, Calendar, Sparkles, User, Bell, ChevronRight, Trophy, MessageSquare } from 'lucide-react';
import LoginGate from './components/LoginGate';
import PresidentBanner from './components/PresidentBanner';
import MealCard from './components/MealCard';
import TimetableCard from './components/TimetableCard';
import DashboardNotices from './components/DashboardNotices';
import DDayCard from './components/DDayCard';
import QuickLinks from './components/QuickLinks';
import TeacherControlCenter from './components/TeacherControlCenter';
import AIStudyChatbot from './components/AIStudyChatbot';
import StudentProfile from './components/StudentProfile';
import DailyIdiomCard from './components/DailyIdiomCard';
import FreeBoard from './components/FreeBoard';
import { cn } from './lib/utils';
import { Brain, UserCircle, Bot } from 'lucide-react';
import { getDailyContent } from './lib/dailyContent';

type TabType = 'dashboard' | 'meal' | 'chat' | 'timetable' | 'management' | 'profile' | 'board';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const [presidentMessage] = useState("평택고 1-1 친구들, 내일 수행평가 잊지 말고 준비해오자! 화이팅! 🦅");

  const studentId = localStorage.getItem('student_id') || '0';
  const studentName = localStorage.getItem('student_name') || '친구';
  const studentRole = localStorage.getItem('student_role') || 'student';

  const { quote } = getDailyContent();

  const handleLogout = () => {
    localStorage.removeItem('classmate_auth');
    localStorage.removeItem('student_id');
    localStorage.removeItem('student_name');
    localStorage.removeItem('student_role');
    window.location.href = '/';
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
    { id: 'board', label: '자유게시판', icon: MessageSquare },
    { id: 'chat', label: 'AI 상담', icon: Bot },
    { id: 'timetable', label: '시간표', icon: Calendar },
    { id: 'profile', label: '프로필', icon: UserCircle },
  ] as const;

  const teacherTabs = [
    ...tabs,
    { id: 'management', label: '관리', icon: Settings },
  ] as const;

  const currentTabs = studentRole === 'teacher' 
    ? teacherTabs.filter(tab => tab.id !== 'chat') 
    : tabs;

  return (
    <LoginGate>
      <div className="min-h-screen bg-[#F2F2F7] font-sans text-[#1C1C1E] flex flex-col pb-24">
        
        {/* iOS Style Status Header */}
        <header className="sticky top-0 z-40 bg-[#F2F2F7]/80 backdrop-blur-3xl px-6 pt-12 pb-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.14em] text-ios-gray uppercase mb-0.5">{todayStr}</span>
              <h1 className="text-3xl font-[900] tracking-tight text-[#1C1C1E]">
                {activeTab === 'dashboard' ? '오늘' : currentTabs.find(t => t.id === activeTab)?.label}
              </h1>
            </div>
             <div className="flex items-center gap-3">
               <button 
                  onClick={() => setActiveTab('profile')}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm overflow-hidden",
                    activeTab === 'profile' ? "ring-2 ring-ios-blue ring-offset-2" : "bg-white border border-black/[0.05]"
                  )}
               >
                  {activeTab === 'profile' ? (
                    <div className="w-full h-full bg-[#1C1C1E] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <User className="w-5 h-5 text-ios-blue" />
                  )}
               </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className={cn(
          "flex-1 w-full flex flex-col transition-all duration-500",
          activeTab === 'chat' ? "max-w-none px-0 pt-0" : "max-w-6xl mx-auto px-4 sm:px-8 pt-4"
        )}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.99 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 h-full flex flex-col"
            >
              {activeTab === 'dashboard' && (
                <div className="flex flex-col gap-6">
                  {/* Notice Section Integrated at Top */}
                  <DashboardNotices />

                  {/* President Message & D-Day Banner */}
                  <PresidentBanner message={presidentMessage} />

                  {/* High Intensity Content - Midterm Focus */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <TimetableCard />
                    <MealCard />
                  </div>

                  {/* Daily Idiom Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                     <div className="md:col-span-1"> <DDayCard /> </div>
                     <div className="md:col-span-2"> 
                       <DailyIdiomCard />
                     </div>
                  </div>

                  {/* Location & Weather Mini */}
                  <div className="ios-card flex items-center justify-between bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">🌤️</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight">평택시 합정동</span>
                        <span className="text-[10px] font-bold text-ios-gray uppercase tracking-widest">청명함 • 18°C</span>
                      </div>
                    </div>
                    <div className="bg-ios-bg/80 px-4 py-2 rounded-2xl flex flex-col items-center border border-black/[0.02]">
                        <span className="text-[9px] font-black text-ios-gray uppercase tracking-widest">습도</span>
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

                  <div className="ios-card border-dashed border-2 border-[#8E8E93]/20 flex items-center gap-4 text-[#8E8E93]">
                    <div className="p-3 bg-gray-100 rounded-2xl"> <Info className="w-5 h-5" /> </div>
                    <p className="text-xs font-medium italic">이 시스템은 우리 반의 소중한 일정을 함께 관리하기 위해 제작되었습니다.</p>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <AIStudyChatbot />
              )}

              {activeTab === 'board' && (
                <FreeBoard />
              )}

              {activeTab === 'profile' && (
                <div className="max-w-4xl mx-auto w-full px-4">
                  <StudentProfile />
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
                     "p-1.5 rounded-2xl transition-all duration-300",
                     isActive ? "text-ios-blue scale-100" : "text-[#8E8E93]"
                   )}>
                     <tab.icon className={cn("w-5 h-5 transition-all", isActive && "fill-ios-blue/15")} />
                   </div>
                   <span className={cn(
                     "text-[8px] font-bold uppercase tracking-[0.1em] transition-all duration-300",
                     isActive ? "text-ios-blue opacity-100" : "text-[#8E8E93] opacity-50"
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
