import { useState, useEffect, type ReactNode, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { STUDENT_LIST } from '@/src/constants/students';
import { db } from '@/src/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface LoginGateProps {
  children: ReactNode;
}

export default function LoginGate({ children }: LoginGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [studentNumber, setStudentNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('번호(1-32)와 이름을 정확히 입력해줘!');

  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [currentTeacherPassword, setCurrentTeacherPassword] = useState('0000');

  useEffect(() => {
    const saved = localStorage.getItem('classmate_auth');
    if (saved) {
      setIsAuthenticated(true);
    }

    // Fetch current teacher password for UI hints
    const fetchTeacherAuth = async () => {
      try {
        const teacherConfigDoc = await getDoc(doc(db, 'config', 'teacher_auth'));
        if (teacherConfigDoc.exists()) {
          setCurrentTeacherPassword(teacherConfigDoc.data().password || '0000');
        }
      } catch (err) {
        console.error("Error fetching teacher auth:", err);
      }
    };
    fetchTeacherAuth();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    const numStr = studentNumber.trim();
    const name = studentName.trim();
    
    setIsCheckingAuth(true);

    try {
      // 선생님 전용 로그인 (비밀번호 활용)
      // 최신 비밀번호를 다시 확인 (혹시 그 사이 바뀌었을 수도 있으니)
      const teacherConfigDoc = await getDoc(doc(db, 'config', 'teacher_auth'));
      const teacherPassword = teacherConfigDoc.exists() ? teacherConfigDoc.data().password : '0000';

      if (numStr === teacherPassword && name === '김성연') {
        localStorage.setItem('classmate_auth', 'true');
        localStorage.setItem('student_id', '0');
        localStorage.setItem('student_name', '김성연');
        localStorage.setItem('student_role', 'teacher');
        setIsAuthenticated(true);
        setError(false);
        return;
      } else if (numStr === teacherPassword && name !== '김성연' && name !== '') {
        setErrorMessage('선생님 성함을 정확히 입력해줘!');
        setError(true);
        setIsCheckingAuth(false);
        return;
      }

      const num = parseInt(numStr);
      
      // 번호와 이름이 일치하는지 확인
      if (!isNaN(num) && STUDENT_LIST[num]) {
        const student = STUDENT_LIST[num];
        
        // 이름이 일치하는지 확인 (공백 제거 후 비교)
        if (student.name === name) {
          localStorage.setItem('classmate_auth', 'true');
          localStorage.setItem('student_id', num.toString());
          localStorage.setItem('student_name', student.name);
          localStorage.setItem('student_role', student.role);
          
          setIsAuthenticated(true);
          setError(false);
        } else {
          setErrorMessage('이름이 번호와 일치하지 않아. 다시 확인해줘!');
          setError(true);
        }
      } else {
        setErrorMessage('등록된 번호가 아니거나 입력이 잘못되었어!');
        setError(true);
      }
    } catch (err) {
      console.error("Login verification error:", err);
      setErrorMessage("로그인 처리 중 오류가 발생했습니다.");
      setError(true);
    } finally {
      setIsCheckingAuth(false);
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
          <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl shadow-ios-blue/10 flex items-center justify-center mx-auto mb-8 border border-white/40 overflow-hidden">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBRx0uXA8FsJR-0kuBYUjwuVn26reRUG5NyFKxvOhBJ6gDMWUWxOivmtJQ&s=10" 
              alt="평택고등학교 로고" 
              className="w-16 h-16 object-contain"
              referrerPolicy="no-referrer"
            />
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
                  error && !(studentNumber === currentTeacherPassword || (parseInt(studentNumber) >= 1 && parseInt(studentNumber) <= 32)) ? "ring-4 ring-ios-red/20 bg-ios-red/5" : "focus:ring-4 focus:ring-ios-blue/10 bg-white"
                )}
                autoFocus
              />
              {studentNumber === currentTeacherPassword && (
                <div className="absolute right-6 top-1/2 -translate-y-1/2">
                  <span className="px-3 py-1 bg-ios-blue text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                    Teacher Verified
                  </span>
                </div>
              )}
            </div>
            
            <AnimatePresence mode="wait">
                <motion.input
                  key="name-input"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder={studentNumber === currentTeacherPassword ? "성함을 입력해줘 (김성연)" : "이름을 입력해줘"}
                  className={cn(
                    "w-full px-8 py-5 bg-white rounded-[1.5rem] border-transparent transition-all outline-none text-lg font-black placeholder:text-gray-200 shadow-sm",
                    error && studentName.trim().length === 0 ? "ring-4 ring-ios-red/20 bg-ios-red/5" : "focus:ring-4 focus:ring-ios-blue/10 bg-white"
                  )}
                />
            </AnimatePresence>

            <button
              type="submit"
              disabled={isCheckingAuth}
              className="w-full py-5 mt-2 bg-ios-blue text-white rounded-[1.5rem] flex items-center justify-center gap-2 font-black uppercase tracking-widest hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-ios-blue/20"
            >
              {isCheckingAuth ? '확인 중...' : '입장하기'} <ArrowRight className="w-5 h-5" />
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
                {errorMessage}
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
