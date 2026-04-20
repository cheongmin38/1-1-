import { useState, useEffect, type ReactNode, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowRight, User, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LoginGateProps {
  children: ReactNode;
}

export default function LoginGate({ children }: LoginGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [studentNumber, setStudentNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('classmate_auth');
    if (saved) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const num = parseInt(studentNumber);
    const name = studentName.trim();
    
    // 선생님 전용 로그인 (비밀번호 0000 활용)
    if (studentNumber === '0000') {
      localStorage.setItem('classmate_auth', 'true');
      localStorage.setItem('student_id', '0');
      localStorage.setItem('student_name', '김성연');
      localStorage.setItem('student_role', 'teacher');
      setIsAuthenticated(true);
      setError(false);
      return;
    }

    // 1번부터 32번까지만 접속 가능하며 이름이 입력되어야 함
    if (num >= 1 && num <= 32 && name.length >= 1) {
      let role = 'student';
      if (num === 12) role = 'president';
      if (num === 18) role = 'vice';
      
      localStorage.setItem('classmate_auth', 'true');
      localStorage.setItem('student_id', num.toString());
      localStorage.setItem('student_name', name);
      localStorage.setItem('student_role', role);
      
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="fixed inset-0 bg-[#F2F2F7] flex items-center justify-center p-6 z-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl shadow-ios-blue/10 flex items-center justify-center mx-auto mb-8 border border-white/40">
            <User className="w-12 h-12 text-ios-blue" />
          </div>
          <h1 className="text-4xl font-[900] tracking-tighter text-[#1C1C1E]">반가워, 🔥</h1>
          <p className="text-ios-gray mt-4 text-sm font-bold tracking-tight">평택고 1학년 1반 친구들을 위한 공간입니다.<br />정보를 입력하고 로그인해줘!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
                placeholder="출석 번호 (1~32 또는 코드)"
                className={cn(
                  "w-full px-8 py-5 bg-white rounded-[1.5rem] border-transparent transition-all outline-none text-lg font-black placeholder:text-gray-200 shadow-sm",
                  error && !(studentNumber === '0000' || (parseInt(studentNumber) >= 1 && parseInt(studentNumber) <= 32)) ? "ring-4 ring-ios-red/20 bg-ios-red/5" : "focus:ring-4 focus:ring-ios-blue/10 bg-white"
                )}
                autoFocus
              />
              {studentNumber === '0000' && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <span className="px-3 py-1 bg-ios-blue text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                    Teacher Verified
                  </span>
                </div>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {studentNumber !== '0000' ? (
                <motion.input
                  key="name-input"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="이름을 입력해줘"
                  className={cn(
                    "w-full px-8 py-5 bg-white rounded-[1.5rem] border-transparent transition-all outline-none text-lg font-black placeholder:text-gray-200 shadow-sm",
                    error && studentName.trim().length === 0 ? "ring-4 ring-ios-red/20 bg-ios-red/5" : "focus:ring-4 focus:ring-ios-blue/10 bg-white"
                  )}
                />
              ) : (
                <motion.div
                  key="teacher-reveal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full px-8 py-5 bg-ios-blue/5 rounded-[1.5rem] border border-ios-blue/10 flex items-center justify-between"
                >
                  <span className="text-ios-blue font-black tracking-tight">반갑습니다, 김성연 선생님!</span>
                  <Sparkles className="w-4 h-4 text-ios-blue" />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full py-5 mt-2 bg-ios-blue text-white rounded-[1.5rem] flex items-center justify-center gap-2 font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-ios-blue/20"
            >
              입장하기 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-ios-red text-[10px] text-center font-black uppercase tracking-widest"
              >
                번호(1-32)와 이름을 정확히 입력해줘!
              </motion.p>
            )}
          </AnimatePresence>
        </form>
        
        <div className="mt-12 flex flex-col items-center gap-2">
          <p className="text-[10px] text-ios-gray text-center font-black uppercase tracking-[0.2em]">
            Pyeongtaek Eagle Gate • Class 1-1
          </p>
          <div className="flex gap-2">
            <div className="w-1 h-1 bg-ios-blue rounded-full" />
            <div className="w-1 h-1 bg-ios-gray/20 rounded-full" />
            <div className="w-1 h-1 bg-ios-gray/20 rounded-full" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
