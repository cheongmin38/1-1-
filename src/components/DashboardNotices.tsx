import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Calendar, ChevronLeft, ChevronRight, Clock, Megaphone, Info, AlertTriangle } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, onSnapshot, where, Timestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface Notice {
  id: string;
  content: string;
  authorName: string;
  createdAt: any;
  type: 'general' | 'urgent' | 'assessment';
  viewers?: string[];
}

export default function DashboardNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const studentName = localStorage.getItem('student_name') || '익명';
  const studentRole = localStorage.getItem('student_role') || 'student';

  useEffect(() => {
    const q = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notice[];
      setNotices(data);
    });
    return () => unsubscribe();
  }, []);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getNoticesByDate = (date: Date) => {
    const target = formatDate(date);
    return notices.filter(n => {
      if (!n.createdAt?.toDate) return false;
      return formatDate(n.createdAt.toDate()) === target;
    });
  };

  const currentNotices = getNoticesByDate(selectedDate);

  // Mark notices as read when they appear in the current view
  useEffect(() => {
    if (studentRole === 'teacher') return; // Don't track teacher views
    
    currentNotices.forEach(notice => {
      if (!notice.viewers?.includes(studentName)) {
        updateDoc(doc(db, 'notices', notice.id), {
          viewers: arrayUnion(studentName)
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
                        {notice.type === 'urgent' ? '긴급' : notice.type === 'assessment' ? '평가' : '일반'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-ios-gray">
                       {notice.createdAt?.toDate ? new Date(notice.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-[14px] font-medium text-[#1C1C1E] whitespace-pre-wrap leading-relaxed">
                    {notice.content}
                  </p>
                  <div className="mt-3 pt-2 border-t border-black/[0.05] flex items-center justify-end">
                    <span className="text-[11px] font-black text-ios-gray flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {notice.authorName} 선생님
                    </span>
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

      <button className="w-full mt-4 py-3 bg-[#F2F2F7] hover:bg-[#E5E5EA] rounded-xl text-[11px] font-black text-ios-gray uppercase tracking-widest transition-all">
        전체 공지 내역 보기
      </button>
    </div>
  );
}
