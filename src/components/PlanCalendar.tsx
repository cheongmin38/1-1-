import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, X, Calendar as CalendarIcon, Clock, Type, FileText, Info, Loader2 } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  Timestamp,
  deleteDoc,
  doc,
  orderBy
} from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  type: 'exam' | 'activity' | 'holiday' | 'other';
}

export default function PlanCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<Event['type']>('activity');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const studentRole = localStorage.getItem('student_role');
  const isTeacher = studentRole === 'teacher';

  useEffect(() => {
    const q = query(collection(db, 'events'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(data);
    });
    return () => unsubscribe();
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const formatYMD = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDate = (dateStr: string) => events.filter(e => e.date === dateStr);

  const handleAddEvent = async () => {
    if (!selectedDate || !newTitle.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'events'), {
        title: newTitle.trim(),
        description: newDesc.trim(),
        date: selectedDate,
        type: newType,
        createdAt: Timestamp.now()
      });
      setIsAdding(false);
      setNewTitle('');
      setNewDesc('');
    } catch (err) {
      console.error(err);
      alert('일정 추가 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('이 일정을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'events', id));
    } catch (err) {
      console.error(err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="ios-card flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-xl font-[900] tracking-tight text-[#1C1C1E]">학급 일정 달력</h2>
          <span className="text-[10px] font-black text-ios-gray uppercase tracking-widest">{year}년 {month + 1}월</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-ios-bg rounded-xl transition-all">
            <ChevronLeft className="w-5 h-5 text-ios-gray" />
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-ios-bg rounded-xl transition-all">
            <ChevronRight className="w-5 h-5 text-ios-gray" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
          <div key={d} className={cn(
            "text-[10px] font-black uppercase text-center py-2",
            i === 0 ? "text-ios-red" : i === 6 ? "text-ios-blue" : "text-ios-gray"
          )}>
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="p-2" />;
          
          const dateStr = formatYMD(year, month, day);
          const dateEvents = getEventsForDate(dateStr);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(dateStr)}
              className={cn(
                "relative group aspect-square flex flex-col items-center justify-start p-2 rounded-2xl transition-all",
                isToday ? "bg-ios-blue/5" : "hover:bg-ios-bg",
                isSelected ? "ring-2 ring-ios-blue ring-offset-1" : ""
              )}
            >
              <span className={cn(
                "text-sm font-black mb-1",
                isToday ? "text-ios-blue" : "text-[#1C1C1E]",
                i % 7 === 0 ? "text-ios-red/70" : i % 7 === 6 ? "text-ios-blue/70" : ""
              )}>
                {day}
              </span>
              <div className="flex flex-wrap justify-center gap-0.5 mt-auto">
                {dateEvents.slice(0, 3).map((e, idx) => (
                  <div key={idx} className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    e.type === 'exam' ? "bg-ios-red" : 
                    e.type === 'holiday' ? "bg-ios-orange" : 
                    e.type === 'activity' ? "bg-ios-blue" : "bg-ios-gray"
                  )} />
                ))}
                {dateEvents.length > 3 && <div className="w-1 h-1 bg-gray-300 rounded-full" />}
              </div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-4 border-t border-black/5 pt-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-[900] text-[#1C1C1E]">{selectedDate} 일정</h3>
              {isTeacher && !isAdding && (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-ios-blue text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all"
                >
                  <Plus className="w-3 h-3" /> 일정 추가
                </button>
              )}
            </div>

            {isAdding && (
              <div className="bg-ios-bg/50 p-4 rounded-3xl border border-black/5 flex flex-col gap-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase text-ios-gray tracking-widest">새 일정 작성</span>
                  <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-white rounded-lg">
                    <X className="w-4 h-4 text-ios-gray" />
                  </button>
                </div>
                <input 
                  type="text" 
                  placeholder="일정 제목" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white px-4 py-3 rounded-2xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-ios-blue/20"
                />
                <select 
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as Event['type'])}
                  className="w-full bg-white px-4 py-3 rounded-2xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-ios-blue/20"
                >
                  <option value="activity">창체/활동</option>
                  <option value="exam">시험/평가</option>
                  <option value="holiday">공휴일/방학</option>
                  <option value="other">기타</option>
                </select>
                <textarea 
                  placeholder="상세 설명 (선택)" 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-white px-4 py-3 rounded-2xl text-xs font-bold border-none outline-none focus:ring-2 focus:ring-ios-blue/20 h-20 resize-none"
                />
                <button 
                  onClick={handleAddEvent}
                  disabled={!newTitle.trim() || isSubmitting}
                  className="w-full py-3 bg-ios-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin"/> : <Plus className="w-3 h-3"/>}
                  완료
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((e) => (
                  <div key={e.id} className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-black/[0.03] shadow-sm group">
                    <div className={cn(
                      "w-1.5 h-10 rounded-full",
                      e.type === 'exam' ? "bg-ios-red" : 
                      e.type === 'holiday' ? "bg-ios-orange" : 
                      e.type === 'activity' ? "bg-ios-blue" : "bg-ios-gray"
                    )} />
                    <div className="flex-1 flex flex-col gap-0.5">
                      <span className="text-sm font-[900] text-[#1C1C1E]">{e.title}</span>
                      {e.description && <p className="text-[11px] font-medium text-ios-gray">{e.description}</p>}
                    </div>
                    {isTeacher && (
                      <button 
                        onClick={() => handleDeleteEvent(e.id)}
                        className="p-2 text-ios-red opacity-0 group-hover:opacity-100 transition-all hover:bg-ios-red/5 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : !isAdding && (
                <div className="flex flex-col items-center justify-center py-8 opacity-20">
                   <CalendarIcon className="w-8 h-8 mb-2" />
                   <p className="text-[10px] font-black uppercase tracking-widest">일정이 없습니다</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Trash2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
