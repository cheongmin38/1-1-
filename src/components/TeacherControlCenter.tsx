import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Trash2, Megaphone, MessageSquare, ShieldCheck, ChevronRight, Ban, CheckCircle2, AlertCircle, Clock, Coffee, ShieldAlert, Key } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';
import { STUDENT_LIST } from '@/src/constants/students';

interface Notice {
  id: string;
  content: string;
  authorName: string;
  createdAt: any;
  viewers?: string[];
}

export default function TeacherControlCenter({ onSelectStudent }: { onSelectStudent?: (id: string) => void }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [freePosts, setFreePosts] = useState<any[]>([]);
  const [students] = useState(Object.values(STUDENT_LIST));
  const [authorizedStudent, setAuthorizedStudent] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    // Notices listener
    const qNotices = query(collection(db, 'notices'));
    const unsubNotices = onSnapshot(qNotices, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notice[];
      const sorted = [...data].sort((a, b) => {
        const getTime = (notice: Notice) => {
          if (!notice.createdAt) return 0;
          if (notice.createdAt.toMillis) return notice.createdAt.toMillis();
          if (notice.createdAt.seconds) return notice.createdAt.seconds * 1000;
          if (notice.createdAt instanceof Date) return notice.createdAt.getTime();
          return 0;
        };
        return getTime(b) - getTime(a);
      });
      setNotices(sorted);
    });

    // Free Board listener
    const qFree = query(collection(db, 'free_board'), orderBy('createdAt', 'desc'));
    const unsubFree = onSnapshot(qFree, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFreePosts(data);
    });

    const configUnsubscribe = onSnapshot(doc(db, 'config', 'permissions'), (snapshot) => {
      if (snapshot.exists()) {
        setAuthorizedStudent(snapshot.data().authorizedStudentNumber || '');
      }
    });

    return () => {
      unsubNotices();
      unsubFree();
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
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteFreePost = async (id: string) => {
    if (!confirm('이 자유게시판 글을 삭제할까요?')) return;
    try {
      await deleteDoc(doc(db, 'free_board', id));
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
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
          <p className="text-ios-gray text-sm font-medium">선생님 전용 중앙 제어판입니다. 학생 활동 및 게시물을 관리하세요.</p>
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
      </div>

      {/* Notice Management */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-ios-blue" />
            게시된 공지 관리
          </h3>
          <span className="text-[10px] font-black text-ios-gray uppercase">{notices.length} TOTAL</span>
        </div>
        <div className="ios-card space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
          {notices.length > 0 ? (
            notices.map((n) => (
              <div key={n.id} className="flex items-center justify-between p-3 bg-[#F2F2F7] rounded-2xl group transition-all hover:bg-white hover:shadow-sm border border-transparent hover:border-black/[0.05]">
                <div className="flex flex-col gap-1 pr-4 flex-1">
                  <p className="text-sm font-bold text-[#1C1C1E] line-clamp-1">{n.content}</p>
                  <div className="flex items-center gap-2 text-ios-gray text-[10px]">
                     <span className="font-medium">{n.authorName}</span>
                     {n.viewers && n.viewers.length > 0 && (
                       <span className="text-ios-blue font-black flex items-center gap-1">
                         • {n.viewers.length}명 읽음
                       </span>
                     )}
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteNotice(n.id)}
                  className="p-3 -m-1.5 text-ios-red bg-ios-red/10 hover:bg-ios-red/20 rounded-xl transition-all active:scale-90"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center py-6 text-sm font-bold text-ios-gray">관리할 공지가 없습니다.</p>
          )}
        </div>
      </div>

      {/* Free Board Management */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-ios-orange" />
            자유게시판 게시물 관리
          </h3>
          <span className="text-[10px] font-black text-ios-gray uppercase">{freePosts.length} POSTS</span>
        </div>
        <div className="ios-card space-y-3 max-h-[300px] overflow-y-auto no-scrollbar border-ios-orange/10">
          {freePosts.length > 0 ? (
            freePosts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-[#F2F2F7] rounded-2xl group transition-all hover:bg-white hover:shadow-sm border border-transparent hover:border-black/[0.05]">
                <div className="flex flex-col gap-1 pr-4 flex-1">
                  <p className="text-sm font-bold text-[#1C1C1E] line-clamp-1">{p.content}</p>
                  <div className="flex items-center gap-2 text-ios-gray text-[10px]">
                     <span className="font-medium">{p.isAnonymous ? '익명' : p.authorName}</span>
                     <span className="text-ios-orange font-black">• 🔥 {p.likes || 0}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteFreePost(p.id)}
                  className="p-3 -m-1.5 text-ios-red bg-ios-red/10 hover:bg-ios-red/20 rounded-xl transition-all active:scale-90"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center py-6 text-sm font-bold text-ios-gray">게시물이 없습니다.</p>
          )}
        </div>
      </div>

      {/* Student List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-ios-green" />
            학생 명렬표 (1~32)
          </h3>
        </div>
        <div className="ios-card grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
           {students.map((s) => (
             <div 
               key={s.number} 
               onClick={() => onSelectStudent?.(s.number.toString())}
               className="aspect-square flex flex-col items-center justify-center bg-[#F2F2F7] rounded-2xl border border-black/[0.03] transition-all hover:scale-105 hover:bg-white hover:shadow-lg group cursor-pointer relative overflow-hidden"
             >
               <span className="text-sm font-black text-[#1C1C1E]">{s.number}</span>
               <span className="text-[10px] font-bold text-[#1C1C1E] truncate w-full text-center px-1">{s.name}</span>
               <span className="text-[7px] font-black text-ios-gray uppercase opacity-0 group-hover:opacity-100 transition-all">
                 {s.role === 'president' ? '반장' : s.role === 'vice' ? '부반장' : '학생'}
               </span>
               <div className="absolute top-1 right-1 w-1 h-1 bg-ios-green rounded-full shadow-[0_0_5px_rgba(40,205,65,0.5)]" />
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
