import { useState, useEffect } from 'react';
import { Timer, Star, PartyPopper, Plus, Trash2, X, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/src/lib/errorHandlers';

interface DDay {
  id?: string;
  label: string;
  date: string;
  color: string;
}

export default function DDayCard() {
  const [days, setDays] = useState<DDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newDate, setNewDate] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editDate, setEditDate] = useState('');
  
  const studentRole = localStorage.getItem('student_role');
  const isTeacher = studentRole === 'teacher';

  useEffect(() => {
    const q = query(collection(db, 'academic_calendar'), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DDay[];
      setDays(events);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'academic_calendar');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDays = days.filter(d => {
    const target = new Date(d.date);
    target.setHours(0, 0, 0, 0);
    return target.getTime() >= today.getTime();
  });

  const handleAddEvent = async () => {
    if (!newLabel || !newDate) return;
    try {
      await addDoc(collection(db, 'academic_calendar'), {
        label: newLabel,
        date: newDate,
        color: newLabel.includes('고사') ? 'bg-ios-red' : 'bg-ios-blue',
        createdAt: serverTimestamp()
      });
      setNewLabel('');
      setNewDate('');
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      alert('일정 추가 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateEvent = async (id: string) => {
    if (!editLabel || !editDate) return;
    try {
      await updateDoc(doc(db, 'academic_calendar', id), {
        label: editLabel,
        date: editDate,
        color: editLabel.includes('고사') ? 'bg-ios-red' : 'bg-ios-blue'
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert('일정 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('이 일정을 삭제할까요?')) return;
    try {
      await deleteDoc(doc(db, 'academic_calendar', id));
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const startEditing = (d: DDay) => {
    if (!d.id) return;
    setEditingId(d.id);
    setEditLabel(d.label);
    setEditDate(d.date);
  };

  const calculateDDay = (targetDate: string) => {
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    
    const diff = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'D-Day';
    return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
  };

  return (
    <div className="ios-card flex flex-col h-full bg-white relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
            <h2 className="text-xl font-bold text-[#1C1C1E] tracking-tight">학사 일정</h2>
            <span className="text-[9px] font-black text-ios-gray uppercase tracking-widest opacity-60">Calendar</span>
        </div>
        <div className="flex items-center gap-2">
          {isTeacher && (
             <button 
               onClick={() => setIsAdding(!isAdding)}
               className={cn(
                 "p-2 rounded-xl border border-black/[0.01] transition-all",
                 isAdding ? "bg-ios-red/10 text-ios-red" : "bg-ios-bg text-ios-gray hover:text-ios-blue"
               )}
             >
               {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
             </button>
          )}
          <div className="bg-ios-bg p-2 rounded-xl border border-black/[0.01]">
            <Timer className="w-4 h-4 text-ios-gray" />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-ios-bg rounded-2xl flex flex-col gap-2"
          >
            <input 
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="일정 명칭 (예: 체육대회)"
              className="bg-white rounded-xl px-4 py-2 text-xs font-bold focus:outline-none"
            />
            <div className="flex gap-2">
              <input 
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 bg-white rounded-xl px-4 py-2 text-xs font-bold focus:outline-none"
              />
              <button 
                onClick={handleAddEvent}
                className="p-2 bg-ios-blue text-white rounded-xl active:scale-95 transition-all"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[300px] pr-1 scrollbar-hide">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="w-4 h-4 border-2 border-ios-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : upcomingDays.length > 0 ? (
          upcomingDays.map((d, i) => (
            <div key={d.id || i} className="group flex flex-col p-4 bg-ios-bg/40 rounded-2xl border border-transparent hover:border-black/[0.03] transition-all">
              {editingId === d.id ? (
                <div className="flex flex-col gap-2">
                  <input 
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full bg-white rounded-xl px-4 py-2 text-xs font-bold focus:outline-none shadow-sm"
                  />
                  <div className="flex gap-2">
                    <input 
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="flex-1 bg-white rounded-xl px-4 py-2 text-xs font-bold focus:outline-none shadow-sm"
                    />
                    <button 
                      onClick={() => d.id && handleUpdateEvent(d.id)}
                      className="p-2 bg-ios-blue text-white rounded-xl active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="p-2 bg-ios-gray/10 text-ios-gray rounded-xl active:scale-95 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-1.5 h-1.5 rounded-full ring-4 ring-white shadow-sm", d.color)} />
                    <div className="flex flex-col text-left">
                      <span className="text-[13px] font-bold text-[#1C1C1E] tracking-tight">{d.label}</span>
                      <span className="text-[8px] font-black text-ios-gray uppercase tracking-widest">{d.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isTeacher && (
                      <>
                        <button 
                          onClick={() => startEditing(d)}
                          className="p-1 opacity-0 group-hover:opacity-100 text-ios-blue/30 hover:text-ios-blue transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => d.id && handleDeleteEvent(d.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 text-ios-red/30 hover:text-ios-red transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <span className={cn(
                      "text-lg font-black tracking-tighter tabular-nums ml-2",
                      (d.label.includes('지필') || d.label.includes('고사') || d.label.includes('평가')) ? "text-ios-red" : "text-[#1C1C1E]"
                    )}>
                      {calculateDDay(d.date)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 opacity-20">
            <Timer className="w-8 h-8 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">일정이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
