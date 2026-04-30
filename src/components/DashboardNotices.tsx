import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Calendar, ChevronLeft, ChevronRight, Clock, Megaphone, Info, AlertTriangle, File, ImageIcon, Trash2 } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, onSnapshot, where, Timestamp, doc, updateDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';
import ImageModal from './ImageModal';

interface Notice {
  id: string;
  content: string;
  authorName: string;
  createdAt: any;
  type: 'general' | 'urgent' | 'assessment';
  attachments?: string[];
  viewers?: string[];
}

export default function DashboardNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const studentName = localStorage.getItem('student_name') || '익명';
  const studentId = localStorage.getItem('student_id') || '';
  const studentRole = localStorage.getItem('student_role') || 'student';
  const isTeacher = studentRole === 'teacher' || studentId === '0' || studentName === '김성연';

  useEffect(() => {
    // Note: Removed orderBy from query to ensure notices with missing createdAt aren't filtered out by Firestore
    const q = query(collection(db, 'notices'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notice[];
      // Sort client-side with robust timestamp handling
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
    return () => unsubscribe();
  }, []);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getNoticesByDate = (date: Date) => {
    const target = formatDate(date);
    return notices.filter(n => {
      let noticeDate: Date | null = null;
      if (n.createdAt?.toDate) noticeDate = n.createdAt.toDate();
      else if (n.createdAt?.seconds) noticeDate = new Date(n.createdAt.seconds * 1000);
      else if (n.createdAt instanceof Date) noticeDate = n.createdAt;
      
      if (!noticeDate) return false;
      return formatDate(noticeDate) === target;
    });
  };

  const currentNotices = showAll ? notices : getNoticesByDate(selectedDate);

  // Mark notices as read when they appear in the current view
  useEffect(() => {
    if (studentRole === 'teacher' || studentName === '익명') return; // Don't track teacher or logged-out views
    
    // Viewer identity: "[Number] Name"
    const viewerIdentity = studentId && studentId !== '0' ? `${studentId} ${studentName}` : studentName;
    
    currentNotices.forEach(notice => {
      if (!notice.viewers?.includes(viewerIdentity)) {
        updateDoc(doc(db, 'notices', notice.id), {
          viewers: arrayUnion(viewerIdentity)
        }).catch(err => console.error("Notice read track error:", err));
      }
    });
  }, [selectedDate, notices.length]);

  const changeDate = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + days);
    setSelectedDate(next);
  };

  const isToday = formatDate(selectedDate) === formatDate(new Date());

  // Viewer identity: "[Number] Name"
  const viewerIdentity = studentId && studentId !== '0' ? `${studentId} ${studentName}` : studentName;

  const handleDelete = async (id: string) => {
    if (!confirm('이 공지사항을 삭제할까요?')) return;
    try {
      await deleteDoc(doc(db, 'notices', id));
    } catch (err) {
      console.error("Delete Error:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="ios-card bg-white p-5 border-black/5 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF9500] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF9500]/20">
            <Bell className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1C1C1E] tracking-tight">학급 알림장</h3>
            <p className="text-[10px] text-ios-gray font-bold uppercase tracking-widest leading-none">Class Announcements</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isTeacher && (
             <button 
               onClick={() => setShowAll(!showAll)}
               className={cn(
                 "px-3 py-1.5 rounded-xl text-[10px] font-black transition-all",
                 showAll ? "bg-ios-red text-white" : "bg-[#F2F2F7] text-ios-gray"
               )}
             >
               {showAll ? '날짜별 보기' : '전체 공지'}
             </button>
          )}
          <div className="flex items-center gap-2 bg-[#F2F2F7] p-1 rounded-xl">
            <button 
              onClick={() => changeDate(-1)}
              className="p-1.5 hover:bg-white rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-ios-gray" />
            </button>
            <div className="px-2 text-[11px] font-black min-w-[80px] text-center">
              {isToday ? '오늘' : selectedDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            </div>
            <button 
              onClick={() => changeDate(1)}
              className="p-1.5 hover:bg-white rounded-lg transition-all"
            >
              <ChevronRight className="w-4 h-4 text-ios-gray" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {currentNotices.length > 0 ? (
            <motion.div 
              key={formatDate(selectedDate)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {currentNotices.map((notice) => (
                <div 
                  key={notice.id} 
                  className={cn(
                    "p-4 rounded-2xl border transition-all hover:scale-[1.01]",
                    notice.type === 'urgent' ? "bg-red-50 border-red-100" :
                    notice.type === 'assessment' ? "bg-blue-50 border-blue-100" :
                    "bg-[#F2F2F7]/50 border-black/[0.03]"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {notice.type === 'urgent' && <AlertTriangle className="w-4 h-4 text-ios-red" />}
                      {notice.type === 'assessment' && <Info className="w-4 h-4 text-ios-blue" />}
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        notice.type === 'urgent' ? "text-ios-red" :
                        notice.type === 'assessment' ? "text-ios-blue" :
                        "text-ios-gray"
                      )}>
                        {notice.type === 'urgent' ? '긴급' : notice.type === 'assessment' ? '수행' : '일반'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-ios-gray">
                       {notice.createdAt?.toDate ? new Date(notice.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-[14px] font-medium text-[#1C1C1E] whitespace-pre-wrap leading-relaxed">
                    {notice.content}
                  </p>

                  {notice.attachments && notice.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {notice.attachments.map((file, i) => (
                        <button 
                          key={i} 
                          onClick={() => file.startsWith('data:image') && setPreviewImage(file)}
                          className="w-20 h-20 rounded-xl overflow-hidden border border-black/5 bg-white shadow-sm active:scale-95 transition-all flex items-center justify-center shrink-0"
                        >
                          {file.startsWith('data:image') ? (
                            <img src={file} className="w-full h-full object-cover" />
                          ) : (
                            <File className="w-5 h-5 text-ios-blue" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-black/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {notice.viewers && notice.viewers.length > 0 && (
                        <span className="text-[9px] font-black text-ios-blue bg-ios-blue/5 px-2 py-1 rounded-md">
                          {notice.viewers.length}번 읽음
                        </span>
                      )}
                      {notice.viewers?.includes(viewerIdentity) && (
                        <span className="text-[9px] font-black text-ios-green bg-ios-green/5 px-2 py-1 rounded-md">확인 완료</span>
                      )}
                    </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-ios-gray flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> {notice.authorName} 
                          {(() => {
                            let d: Date | null = null;
                            if (notice.createdAt?.toDate) d = notice.createdAt.toDate();
                            else if (notice.createdAt?.seconds) d = new Date(notice.createdAt.seconds * 1000);
                            else if (notice.createdAt instanceof Date) d = notice.createdAt;
                            return showAll && d ? ` (${formatDate(d)})` : '';
                          })()}
                        </span>
                        {isTeacher && (
                          <button 
                            onClick={() => handleDelete(notice.id)}
                            className="p-1.5 text-ios-red hover:bg-ios-red/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 bg-[#F2F2F7]/30 rounded-2xl border border-dashed border-black/10"
            >
              <Megaphone className="w-10 h-10 text-ios-gray opacity-20 mb-3" />
              <p className="text-xs font-bold text-ios-gray">등록된 공지사항이 없습니다.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
