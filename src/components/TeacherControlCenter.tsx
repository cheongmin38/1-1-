import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Trash2, Megaphone, ShieldCheck, ChevronRight, Ban, CheckCircle2, AlertCircle, Clock, Coffee, ShieldAlert, Key } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface Notice {
  id: string;
  content: string;
  authorName: string;
  createdAt: any;
}

export default function TeacherControlCenter() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [students] = useState(Array.from({ length: 32 }, (_, i) => ({ id: i + 1, name: `학생 ${i + 1}` })));
  const [authorizedStudent, setAuthorizedStudent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notice[];
      setNotices(data);
    });

    const configUnsubscribe = onSnapshot(doc(db, 'config', 'permissions'), (snapshot) => {
      if (snapshot.exists()) {
        setAuthorizedStudent(snapshot.data().authorizedStudentNumber || '');
      }
    });

    return () => {
      unsubscribe();
      configUnsubscribe();
    };
  }, []);

  const handleUpdatePermission = async () => {
    setIsUpdating(true);
    try {
      await setDoc(doc(db, 'config', 'permissions'), {
        authorizedStudentNumber: authorizedStudent
      }, { merge: true });
      alert(`${authorizedStudent}번 학생에게 수행평가 공지 권한을 부여했습니다.`);
    } catch (err) {
      console.error(err);
      alert('권한 설정 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm('이 공지사항을 삭제할까요?')) return;
    try {
      await deleteDoc(doc(db, 'notices', id));
    } catch (err) {
      console.error(err);
      alert('삭제 권한이 없거나 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Admin Header */}
      <div className="ios-card-premium bg-[#1C1C1E] text-white overflow-hidden border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-0.5 bg-ios-blue rounded text-[9px] font-black uppercase tracking-widest">Admin Mode</div>
            <span className="text-[10px] font-bold text-ios-gray uppercase tracking-widest">System Control Center</span>
          </div>
          <h2 className="text-3xl font-[900] tracking-tight mb-1">우리 반 관리 도구</h2>
          <p className="text-ios-gray text-sm font-medium">선생님 전용 중앙 제어판입니다. 학생 활동 및 공지를 관리하세요.</p>
        </div>
      </div>

      {/* Permission Delegation */}
      <div className="ios-card bg-ios-blue/5 border-ios-blue/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-ios-blue text-white rounded-2xl">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-[#1C1C1E]">수행평가 공지 권한 위임</h3>
            <p className="text-[10px] font-bold text-ios-gray uppercase tracking-widest">Student Permission Delegate</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="부여할 학생의 번호 입력 (예: 15)" 
            value={authorizedStudent}
            onChange={(e) => setAuthorizedStudent(e.target.value)}
            className="flex-1 px-5 py-4 bg-white rounded-2xl text-sm font-black outline-none border border-black/5 focus:border-ios-blue/30 transition-all"
          />
          <button 
            onClick={handleUpdatePermission}
            disabled={isUpdating}
            className="px-8 py-4 bg-ios-blue text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-ios-blue/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {isUpdating ? '저장 중...' : '권한 부여'}
          </button>
        </div>
        <p className="mt-3 text-[11px] font-bold text-ios-gray">
          * 지정된 번호의 학생은 '알림장' 탭에서 수행평가 관련 공지를 작성할 수 있게 됩니다.
        </p>
      </div>

      {/* Grid Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Notice Management */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-ios-blue" />
              게시된 공지 관리
            </h3>
            <span className="text-[10px] font-black text-ios-gray uppercase">{notices.length} TOTAL</span>
          </div>
          <div className="ios-card space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
            {notices.length > 0 ? (
              notices.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-3 bg-[#F2F2F7] rounded-2xl group transition-all hover:bg-white hover:shadow-sm border border-transparent hover:border-black/[0.05]">
                  <div className="flex flex-col gap-1 pr-4">
                    <p className="text-sm font-bold text-[#1C1C1E] line-clamp-1">{n.content}</p>
                    <span className="text-[10px] font-medium text-ios-gray">{n.authorName} • {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleDateString() : '방금 전'}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteNotice(n.id)}
                    className="p-2 text-ios-red opacity-0 group-hover:opacity-100 transition-all hover:bg-ios-red/10 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center py-10 text-sm font-bold text-ios-gray">관리할 공지가 없습니다.</p>
            )}
          </div>
        </div>

        {/* Attendance / Student Quick View */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-ios-blue" />
              학생 명렬표 (1~32)
            </h3>
            <div className="flex gap-1.5">
               <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-[8px] font-black rounded uppercase">32 Active</span>
            </div>
          </div>
          <div className="ios-card grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[400px] overflow-y-auto no-scrollbar">
             {students.map((s) => (
               <div key={s.id} className="aspect-square flex flex-col items-center justify-center bg-[#F2F2F7] rounded-2xl border border-black/[0.03] transition-all hover:scale-105 hover:bg-white hover:shadow-lg group cursor-pointer relative overflow-hidden">
                 <span className="text-lg font-black text-[#1C1C1E]">{s.id}</span>
                 <span className="text-[8px] font-black text-ios-gray uppercase opacity-0 group-hover:opacity-100 transition-all">Student</span>
                 <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full border border-white" />
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
