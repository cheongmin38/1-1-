import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Megaphone, Trash2, Clock, User, Sparkles, Loader2 } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';

interface Notice {
  id: string;
  content: string;
  authorName: string;
  createdAt: any;
}

export default function TeacherNoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const studentRole = localStorage.getItem('student_role');
  const storedName = localStorage.getItem('student_name');
  const studentName = studentRole === 'teacher' ? '김성연' : (storedName || '선생님');
  const isTeacher = studentRole === 'teacher';

  useEffect(() => {
    // Single robust listener for all notices
    const q = query(collection(db, 'notices'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notice[];
        
        // Robust manual sort to handle different timestamp formats or missing keys
        const sortedData = [...data].sort((a, b) => {
          const getTime = (notice: Notice) => {
            if (!notice.createdAt) return 0;
            if (notice.createdAt.toMillis) return notice.createdAt.toMillis();
            if (notice.createdAt.seconds) return notice.createdAt.seconds * 1000;
            if (notice.createdAt instanceof Date) return notice.createdAt.getTime();
            return 0;
          };
          return getTime(b) - getTime(a);
        });
        
        setNotices(sortedData);
      } catch (err) {
        console.error("Error processing notices:", err);
      }
    }, (error) => {
      console.error("Firestore Listen Error:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('이 공지사항을 삭제할까요?')) return;
    try {
      await deleteDoc(doc(db, 'notices', id));
    } catch (err) {
      console.error("Delete Error:", err);
      alert("삭제 중 오류가 발생했습니다. 권한을 확인해주세요.");
    }
  };

  const handlePostNotice = async () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);
    
    // Create new notice data with local timestamp for fastest performance
    const newNotice = {
      content: input.trim(),
      authorName: studentName,
      createdAt: Timestamp.now(), 
    };

    try {
      await addDoc(collection(db, 'notices'), newNotice);
      setInput('');
    } catch (err) {
      console.error("Error adding notice:", err);
      alert("공지사항 게시 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Teacher Input Area */}
      {isTeacher && (
        <div className="ios-card-premium p-6 border-ios-blue/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-ios-blue text-white flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <h3 className="font-black text-sm uppercase tracking-widest text-[#1C1C1E]">선생님 공지사항 작성</h3>
          </div>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="친구들에게 전달할 내용을 적어주세요..."
              className="w-full bg-[#F2F2F7] border-none rounded-2xl p-4 text-sm font-medium resize-none h-24 outline-none focus:ring-2 focus:ring-ios-blue/20 transition-all no-scrollbar"
            />
            <button
              onClick={handlePostNotice}
              disabled={!input.trim() || isSending}
              className="mt-3 w-full bg-ios-blue text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              바로 공지 올리기
            </button>
          </div>
        </div>
      )}

      {/* Notice List */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black tracking-tight text-[#1C1C1E]">최근 공지사항</h2>
          <span className="text-[10px] font-black text-ios-gray uppercase tracking-[0.2em]">{notices.length} MESSAGES</span>
        </div>
        
        <AnimatePresence initial={false}>
          {notices.length > 0 ? (
            notices.map((notice) => (
              <motion.div
                key={notice.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="ios-card flex flex-col gap-4 relative overflow-hidden"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#1C1C1E] flex items-center justify-center">
                       <User className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-black text-[#1C1C1E]">{notice.authorName} 선생님</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-ios-gray mr-2">
                      <Clock className="w-3 h-3" />
                      {notice.createdAt?.toDate ? notice.createdAt.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '방금 전'}
                    </div>
                    {isTeacher && (
                      <button 
                        onClick={() => handleDelete(notice.id)}
                        className="p-1.5 text-ios-red hover:bg-ios-red/10 rounded-xl transition-all"
                        title="공지 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm font-bold leading-relaxed text-[#1C1C1E] whitespace-pre-wrap">
                  {notice.content}
                </p>
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] -rotate-12">
                   <Sparkles className="w-16 h-16 text-ios-blue" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="ios-card border-dashed border-2 border-gray-100 flex flex-col items-center justify-center py-10 gap-3 opacity-50">
               <Megaphone className="w-8 h-8 text-ios-gray" />
               <p className="text-xs font-bold text-ios-gray">아직 등록된 공지사항이 없습니다.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
