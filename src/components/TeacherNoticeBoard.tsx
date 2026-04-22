import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Megaphone, Trash2, Clock, User, Sparkles, Loader2, Paperclip, X, Image as ImageIcon, File } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { cn } from '@/src/lib/utils';
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
  type?: 'general' | 'urgent' | 'assessment';
  attachments?: string[];
}

export default function TeacherNoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [authorizedStudentNum, setAuthorizedStudentNum] = useState('');
  const [noticeType, setNoticeType] = useState<'general' | 'assessment'>('general');
  
  const studentRole = localStorage.getItem('student_role');
  const storedName = localStorage.getItem('student_name');
  const studentNum = localStorage.getItem('student_id') || '';
  
  // Explicitly check for 'teacher' role string
  const isTeacher = studentRole === 'teacher';
  const isAuthorizedStudent = studentNum === authorizedStudentNum;
  const canPost = isTeacher || isAuthorizedStudent;
  
  const studentName = isTeacher ? '김성연' : (storedName || '학생');

  useEffect(() => {
    // Listen for notices
    const q = query(collection(db, 'notices'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Notice[];
        
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
    });

    // Listen for permissions
    const permUnsubscribe = onSnapshot(doc(db, 'config', 'permissions'), (snapshot) => {
      if (snapshot.exists()) {
        setAuthorizedStudentNum(snapshot.data().authorizedStudentNumber || '');
      }
    });

    return () => {
      unsubscribe();
      permUnsubscribe();
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments = [...attachments];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 800000) { // Approx 800KB limit for base64 in Firestore
        alert(`파일 '${file.name}'이 너무 큽니다. 800KB 이하의 파일만 첨부 가능합니다.`);
        continue;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachments(prev => [...prev, event.target?.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!confirm('이 공지사항을 삭제할까요?')) return;
    
    try {
      console.log("Attempting to delete notice:", id);
      await deleteDoc(doc(db, 'notices', id));
      // onSnapshot will automatically update the UI
    } catch (err: any) {
      console.error("Delete Error details:", err);
      alert(`삭제 중 오류가 발생했습니다: ${err.message || '권한을 확인해주세요.'}`);
    }
  };

  const handlePostNotice = async () => {
    if (!input.trim() || isSending) return;
    setIsSending(true);
    
    const newNotice = {
      content: input.trim(),
      authorName: studentName,
      createdAt: Timestamp.now(), 
      type: isTeacher ? noticeType : 'assessment',
      attachments,
    };

    try {
      await addDoc(collection(db, 'notices'), newNotice);
      setInput('');
      setAttachments([]);
    } catch (err) {
      console.error("Error adding notice:", err);
      alert("공지사항 게시 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Input Area (Teacher or Authorized Student) */}
      {canPost && (
        <div className="ios-card-premium p-6 border-ios-blue/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-ios-blue text-white flex items-center justify-center">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest text-[#1C1C1E]">
                  {isTeacher ? '선생님 공지사항 작성' : '수행평가 공지 작성 (담당자)'}
                </h3>
                <p className="text-[9px] font-black text-ios-gray tracking-tighter">POST NEW ANNOUNCEMENT</p>
              </div>
            </div>
            {isTeacher && (
              <div className="flex bg-ios-bg p-1 rounded-xl">
                 <button 
                  onClick={() => setNoticeType('general')}
                  className={cn("px-3 py-1 text-[10px] font-black rounded-lg transition-all", noticeType === 'general' ? "bg-white shadow-sm text-[#1C1C1E]" : "text-ios-gray")}
                 >일반</button>
                 <button 
                  onClick={() => setNoticeType('assessment')}
                  className={cn("px-3 py-1 text-[10px] font-black rounded-lg transition-all", noticeType === 'assessment' ? "bg-white shadow-sm text-ios-red" : "text-ios-gray")}
                 >수행</button>
              </div>
            )}
          </div>

          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="친구들에게 전달할 내용을 적어주세요..."
              className="w-full bg-[#F2F2F7] border-none rounded-2xl p-4 text-sm font-medium resize-none h-32 outline-none focus:ring-2 focus:ring-ios-blue/20 transition-all no-scrollbar"
            />
            
            {/* Attachment Preview */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 p-2 bg-white rounded-2xl border border-black/5">
                {attachments.map((file, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden bg-ios-bg flex items-center justify-center border border-black/5 group">
                    {file.startsWith('data:image') ? (
                      <img src={file} className="w-full h-full object-cover" />
                    ) : (
                      <File className="w-6 h-6 text-ios-gray" />
                    )}
                    <button 
                      onClick={() => removeAttachment(idx)}
                      className="absolute top-0.5 right-0.5 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              <label className="flex-1">
                <div className="w-full h-14 bg-[#F2F2F7] rounded-2xl border-2 border-dashed border-ios-gray/20 flex items-center justify-center gap-2 text-ios-gray hover:text-ios-blue hover:border-ios-blue/30 cursor-pointer transition-all">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">파일/사진 첨부</span>
                </div>
                <input type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
              </label>
              
              <button
                onClick={handlePostNotice}
                disabled={!input.trim() || isSending}
                className="w-32 h-14 bg-ios-blue text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-ios-blue/10"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                게시
              </button>
            </div>
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
                className={cn(
                  "ios-card flex flex-col gap-4 relative overflow-hidden border-2",
                  notice.type === 'assessment' ? "border-ios-red/10 bg-ios-red/5" : "border-transparent"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center",
                      notice.type === 'assessment' ? "bg-ios-red text-white" : "bg-[#1C1C1E] text-white"
                    )}>
                       <User className="w-3 h-3" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#1C1C1E]">{notice.authorName}</span>
                      {notice.type === 'assessment' && (
                        <span className="ml-2 text-[8px] font-black bg-ios-red/10 text-ios-red px-1 rounded">수행평가</span>
                      )}
                    </div>
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

                {notice.attachments && notice.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {notice.attachments.map((file, i) => (
                      <div key={i} className="max-w-[200px] max-h-[200px] rounded-2xl overflow-hidden border border-black/5 shadow-sm">
                         {file.startsWith('data:image') ? (
                           <img src={file} className="w-full h-full object-contain bg-white" />
                         ) : (
                           <div className="bg-white p-3 flex items-center gap-2">
                             <File className="w-4 h-4 text-ios-blue" />
                             <span className="text-[10px] font-bold truncate">첨부 파일</span>
                           </div>
                         )}
                      </div>
                    ))}
                  </div>
                )}

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
