import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ChevronLeft, Check, Trash2, MessageSquare, Heart, Info, Clock } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface Notification {
  id: string;
  targetUserId: string;
  title: string;
  body: string;
  type: 'comment' | 'like' | 'notice' | 'reply';
  link?: string;
  isRead: boolean;
  createdAt: any;
}

export default function Notifications({ onBack, onNotificationClick }: { onBack: () => void, onNotificationClick?: (link?: string) => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const studentId = localStorage.getItem('student_id') || 'unknown';
  const studentRole = localStorage.getItem('student_role') || 'student';
  const queryId = studentRole === 'teacher' ? 'teacher' : studentId;

  useEffect(() => {
    if (!queryId || queryId === 'unknown') return;

    const q = query(
      collection(db, 'notifications'),
      where('targetUserId', '==', queryId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[];
      setNotifications(docs);
      setIsLoading(false);
    }, (error) => {
      console.error("Notifications list error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [studentId]);

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      await markAsRead(n.id);
    }
    if (onNotificationClick) {
      onNotificationClick(n.link);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { isRead: true });
    });
    await batch.commit();
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const clearAll = async () => {
    if (window.confirm("모든 알림을 삭제하시겠습니까?")) {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.delete(doc(db, 'notifications', n.id));
      });
      await batch.commit();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="w-4 h-4 text-ios-blue" />;
      case 'like': return <Heart className="w-4 h-4 text-ios-red fill-ios-red" />;
      case 'notice': return <Bell className="w-4 h-4 text-ios-orange" />;
      default: return <Info className="w-4 h-4 text-ios-gray" />;
    }
  };

  const getTimeString = (createdAt: any) => {
    if (!createdAt) return '';
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <div className="flex flex-col h-full bg-[#F2F2F7]">
      <header className="bg-white/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-black tracking-tight">알림</h2>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllAsRead} className="text-[10px] font-black text-ios-blue uppercase tracking-widest bg-ios-blue/10 px-2 py-1 rounded-lg">
              모두 읽음
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="p-2 text-ios-gray hover:text-ios-red transition-all">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20">
            <Bell className="w-12 h-12 animate-pulse" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
              <Bell className="w-8 h-8 text-ios-gray/20" />
            </div>
            <div className="space-y-1">
              <p className="font-black text-[#1C1C1E]">알림이 없습니다</p>
              <p className="text-xs text-ios-gray font-medium">새로운 소식이 오면 알려드릴게요.</p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "ios-card relative flex gap-4 transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.98]",
                  n.isRead ? "bg-white/60" : "bg-white shadow-xl shadow-black/[0.03] ring-1 ring-ios-blue/20"
                )}
                onClick={() => handleNotificationClick(n)}
              >
                {!n.isRead && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-ios-blue" />}
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
                  n.isRead ? "bg-gray-100" : "bg-[#F2F2F7]"
                )}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={cn("text-sm tracking-tight truncate", n.isRead ? "font-bold text-ios-gray" : "font-black text-[#1C1C1E]")}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-ios-gray font-bold whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeString(n.createdAt)}
                    </span>
                  </div>
                  <p className={cn("text-xs leading-relaxed line-clamp-2", n.isRead ? "text-ios-gray/70" : "text-ios-gray font-medium")}>
                    {n.body}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="p-2 self-center text-ios-gray/20 hover:text-ios-red transition-all"
                >
                  <Check className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
