import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, User, Loader2, Sparkles, Brain, Save, Trash2, History, ChevronRight, MessageSquare, BookOpen, GraduationCap, Flame, Target, Wand2 } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, limit, setDoc } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
}

interface SavedPlan {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

type PersonaType = 'empathetic' | 'spartan' | 'realistic';

const PERSONAS: Record<PersonaType, { title: string; desc: string; icon: any; color: string; instruction: string }> = {
  empathetic: {
    title: '공감형 선생님',
    desc: '따뜻한 격려와 공감으로 당신의 마음을 다독여줍니다.',
    icon: Sparkles,
    color: 'bg-ios-pink',
    instruction: '당신은 따뜻하고 공감능력이 매우 뛰어난 상담 가이드입니다. 학생의 고민에 먼저 깊이 공감하고, 다정하게 조언해주세요.'
  },
  spartan: {
    title: '스파르타 멘토',
    desc: '엄격하고 강한 어조로 당신의 한계를 몰아붙입니다.',
    icon: Flame,
    color: 'bg-ios-red',
    instruction: '당신은 엄격한 스파르타식 공부 멘토입니다. 현실에 안주하지 않도록 따끔하게 지적하고, 목표 달성을 위해 강하게 푸쉬하세요.'
  },
  realistic: {
    title: '현실 팩트폭격기',
    desc: '냉철한 데이터와 논리로 오직 결과만 생각합니다.',
    icon: Target,
    color: 'bg-[#1C1C1E]',
    instruction: '당신은 냉철하고 논리적인 전문가이며, 일명 \'현실 팩트폭격기\'입니다. 감정에 휘둘리지 않고 학생의 현 상태를 데이터와 논리로 분석하여 촌철살인의 조언을 제공하세요. 불필요한 미사여구는 생략하고 오직 결과와 행동의 효율성에 집중합니다.'
  }
};


export default function AIStudyChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [persona, setPersona] = useState<PersonaType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const studentId = localStorage.getItem('student_id') || 'unknown';
  const studentName = localStorage.getItem('student_name') || '학생';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Load chat session from Firestore
  useEffect(() => {
    if (!studentId) return;

    const chatDocRef = doc(db, 'chats', studentId);
    const unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.messages) setMessages(data.messages);
        if (data.persona) setPersona(data.persona);
      }
    }, (error) => {
      console.error("Chat session load error:", error);
    });

    return () => unsubscribe();
  }, [studentId]);

  // Save messages and persona whenever they change
  const saveChatSession = async (newMessages: Message[], newPersona: PersonaType | null) => {
    if (!studentId) return;
    try {
      await setDoc(doc(db, 'chats', studentId), {
        studentId,
        messages: newMessages,
        persona: newPersona,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error("Save Chat Session Error:", error);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'saved_plans'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plans = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((plan: any) => plan.studentId === studentId) as SavedPlan[];
      setSavedPlans(plans);
    }, (error) => {
      console.error("Saved plans load error:", error);
    });
    return () => unsubscribe();
  }, [studentId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !persona) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(), // Use string ISO for Firestore storage simplicity
    };

    const updatedMessages = [...messages, userMessage];
    
    // Save initial state to state
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

      // We save the session after getting the response, 
      // but let's also save the user message immediately to ensure it's recorded
      await saveChatSession(updatedMessages, persona);

      try {
        // Format history for server API
        const history = messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }));

        const response = await fetch('/api/gemini/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            model: "gemini-2.0-flash",
            contents: [
              ...history,
              { role: 'user', parts: [{ text: userMessage.content }] }
            ],
            config: {
              systemInstruction: `당신은 ${studentName} 학생을 위한 똑똑한 AI 공부 챗봇 '클래스메이트 AI'입니다.
                현재 당신의 성격 유형은 '${PERSONAS[persona].title}'입니다.
                
                [유형별 지침]
                ${PERSONAS[persona].instruction}
                
                [공통 지침]
                1. 학생이 학습 계획을 요청하면 반드시 다음 마크다운 형식을 포함해주세요:
                   ### [계획 제목]
                   (계획 내용 설명...)
                   이후 하단에 학생이 저장할 수 있도록 "✨ 이 계획이 마음에 드시나요? 저장 버튼을 눌러보세요!" 라고 안내하세요.
                2. 단순한 답변보다는 학생이 실천할 수 있는 구체적인 행동 요령을 제시하세요.
                3. 한국어로 자연스럽게 답변하세요.`,
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'AI 서버에 연결하는데 실패했어요.');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) throw new Error('ReadableStream 지원되지 않는 브라우저입니다.');
      
        let fullText = "";
        
        // Add initial empty assistant message to be filled
        const initialAssistantMessage: Message = {
          role: 'assistant',
          content: "",
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, initialAssistantMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunkString = decoder.decode(value, { stream: true });
          const lines = chunkString.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullText += parsed.text;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages.length > 0) {
                      newMessages[newMessages.length - 1] = {
                        ...newMessages[newMessages.length - 1],
                        content: fullText
                      };
                    }
                    return newMessages;
                  });
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }

      // After streaming is complete, save the final state to Firestore
      const finalAssistantMessage: Message = {
        role: 'assistant',
        content: fullText,
        timestamp: new Date().toISOString(),
      };
      await saveChatSession([...updatedMessages, finalAssistantMessage], persona);

    } catch (error: any) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `죄송해요, 응답을 생성하는 중에 오류가 발생했어요. (${error.message})`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      await saveChatSession([...updatedMessages, errorMessage], persona);
    } finally {
      setIsLoading(false);
    }
  };

  const savePlan = async (content: string) => {
    // Extract title from assistant response if it looks like a plan (e.g., ### Title)
    const titleMatch = content.match(/###\s+(.*)/);
    const title = titleMatch ? titleMatch[1].trim() : `${new Date().toLocaleDateString()} 학습 계획`;

    try {
      await addDoc(collection(db, 'saved_plans'), {
        studentId,
        title,
        content,
        createdAt: serverTimestamp(),
      });
      alert("학습 계획이 '나의 계획'에 저장되었습니다!");
    } catch (error) {
      console.error("Save Plan Error:", error);
      alert("계획 저장에 실패했습니다.");
    }
  };

  const deletePlan = async (id: string) => {
    if (window.confirm("정말로 이 계획을 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, 'saved_plans', id));
      } catch (error) {
        console.error("Delete Plan Error:", error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full gap-2 px-2 sm:px-4 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between py-2 px-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500",
            persona ? PERSONAS[persona].color : "bg-ios-blue",
            persona === 'empathetic' ? "shadow-ios-pink/20" : 
            persona === 'spartan' ? "shadow-ios-red/20" : 
            persona === 'realistic' ? "shadow-black/20" : "shadow-ios-blue/20"
          )}>
            {persona ? React.createElement(PERSONAS[persona].icon, { className: "text-white w-5 h-5" }) : <Bot className="text-white w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-lg font-black text-[#1C1C1E] tracking-tight flex items-center gap-2">
              {persona ? PERSONAS[persona].title : '클래스메이트 AI'}
              <Sparkles className="w-4 h-4 text-ios-blue" />
            </h2>
            <p className="text-[9px] text-ios-gray font-bold uppercase tracking-widest leading-none">
              {persona ? 'Study Together' : 'Select Your Mentor'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {persona && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  setPersona(null);
                  // Don't clear messages here, just go back to persona selection to "change" it
                }}
                className="px-3 py-2 rounded-xl bg-[#F2F2F7] text-ios-gray hover:bg-[#E5E5EA] transition-all text-[9px] font-black uppercase tracking-widest border border-black/[0.03]"
              >
                페르소나 변경
              </button>
              <button 
                onClick={() => {
                  if (confirm("대화 내용을 초기화하시겠습니까?")) {
                    setMessages([]);
                    saveChatSession([], persona);
                  }
                }}
                className="p-2.5 rounded-xl bg-ios-red/10 text-ios-red hover:bg-ios-red/20 transition-all border border-ios-red/10"
                title="대화 초기화"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "p-2.5 rounded-2xl transition-all border",
              showHistory ? "bg-[#1C1C1E] text-white border-[#1C1C1E]" : "bg-white text-ios-gray border-black/5 hover:bg-[#F2F2F7]"
            )}
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden relative">
        {/* Main Content Area */}
        <div className={cn(
          "flex-1 flex flex-col ios-card bg-white border-black/5 shadow-2xl shadow-black/[0.02] overflow-hidden transition-all duration-500",
          showHistory ? "hidden lg:flex" : "flex"
        )}>
          {!persona ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto no-scrollbar">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-4xl w-full py-8"
              >
                <div className="space-y-2 mb-10">
                  <h3 className="text-2xl sm:text-4xl font-black text-[#1C1C1E] tracking-tighter">어떤 공부 멘토가 필요하세요?</h3>
                  <p className="text-sm sm:text-base text-ios-gray font-medium">나의 학습 성향과 현재 기분에 맞춰 선택해보세요.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {(Object.entries(PERSONAS) as [PersonaType, typeof PERSONAS['empathetic']][]).map(([id, p]) => (
                    <button
                      key={id}
                      onClick={() => {
                        setPersona(id);
                        saveChatSession(messages, id);
                      }}
                      className="group relative flex flex-col items-center p-8 bg-[#F2F2F7]/50 border border-black/5 rounded-[40px] transition-all hover:scale-[1.03] hover:bg-white hover:shadow-2xl hover:shadow-black/5 text-center space-y-5"
                    >
                      <div className={cn("w-16 h-16 rounded-[28px] flex items-center justify-center transition-transform group-hover:rotate-12 shadow-lg", p.color)}>
                        <p.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-lg font-black text-[#1C1C1E]">{p.title}</h4>
                        <p className="text-[12px] text-ios-gray font-semibold leading-relaxed px-2">{p.desc}</p>
                      </div>
                      <div className="pt-2">
                        <div className="px-5 py-2.5 bg-white border border-black/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-ios-blue group-hover:bg-ios-blue group-hover:text-white transition-all shadow-sm">
                          상담 시작하기
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar bg-[#F2F2F7]/30">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className={cn("w-24 h-24 mx-auto rounded-[36px] flex items-center justify-center shadow-2xl mb-8", PERSONAS[persona].color)}>
                        {React.createElement(PERSONAS[persona].icon, { className: "w-12 h-12 text-white" })}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight">{studentName}님, 준비됐나요?</h3>
                        <p className="text-sm sm:text-base text-ios-gray font-medium max-w-sm mx-auto">
                          {persona === 'empathetic' ? "무엇이든 털어놓으세요. 마음을 다해 들어드릴게요." :
                           persona === 'spartan' ? "대화는 짧게, 공부는 길게! 확실한 계획이 필요한가요?" :
                           "감정 소모 없이 전략적으로 접근하죠. 현재 당면한 과제가 무엇입니까?"}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mt-10">
                        {[
                          "내일 시험인데 벼락치기 계획 짜줘",
                          "공부 효율 매뉴얼 알려줘",
                          "자꾸 잠이 오는데 어떡하죠?",
                          "성적 올리는 가장 빠른 방법"
                        ].map((q) => (
                          <button 
                            key={q}
                            onClick={() => setInput(q)}
                            className="p-5 bg-white hover:bg-white/80 border border-black/[0.05] rounded-[24px] text-[14px] font-bold text-left transition-all hover:translate-y-[-3px] hover:shadow-xl hover:shadow-black/[0.05]"
                          >
                            "{q}"
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                )}

                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      "flex flex-col gap-1.5",
                      m.role === 'user' ? "items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[90%] sm:max-w-[75%] p-4 rounded-[24px] text-[15px] leading-relaxed",
                      m.role === 'user' 
                        ? "bg-ios-blue text-white rounded-tr-none shadow-lg shadow-ios-blue/10" 
                        : "bg-white text-[#1C1C1E] rounded-tl-none shadow-sm border border-black/[0.03]"
                    )}>
                      <div className="whitespace-pre-wrap">{m.content}</div>
                      
                      {m.role === 'assistant' && (m.content.includes('###') || m.content.includes('계획')) && (
                        <button 
                          onClick={() => savePlan(m.content)}
                          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-ios-blue text-white rounded-2xl text-xs font-black transition-all hover:bg-ios-blue/90 shadow-lg shadow-ios-blue/20"
                        >
                          <Save className="w-4 h-4" />
                          이 계획을 '나의 계획'에 저장하기
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-ios-gray font-bold mx-2">
                      {typeof m.timestamp === 'string' ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                       m.timestamp instanceof Date ? m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-2"
                  >
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center border border-black/[0.03]", PERSONAS[persona].color)}>
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <div className="bg-white px-5 py-4 rounded-[24px] rounded-tl-none shadow-sm border border-black/[0.03]">
                      <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-ios-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-black/5">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative max-w-4xl mx-auto w-full">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isLoading ? "답변을 기다리는 중..." : "질문을 입력하세요..."}
                    disabled={isLoading}
                    className="flex-1 bg-[#F2F2F7] rounded-[24px] px-6 py-4 text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-ios-blue/20 transition-all pr-14"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 p-2.5 bg-ios-blue text-white rounded-xl shadow-lg shadow-ios-blue/20 disabled:opacity-50 active:scale-95 transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Saved Plans / History Area */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              className="w-full sm:w-[320px] lg:w-[360px] ios-card bg-white border-black/5 flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-black/5 flex items-center justify-between">
                <h3 className="font-black text-sm flex items-center gap-2">
                  <Save className="w-4 h-4 text-ios-blue" />
                  나의 저장된 계획
                </h3>
                <button onClick={() => setShowHistory(false)} className="sm:hidden p-1">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {savedPlans.length === 0 && (
                  <div className="text-center py-12 text-ios-gray">
                    <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-xs font-bold">저장된 계획이 없어요.</p>
                  </div>
                )}
                {savedPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    layout
                    className="p-3 bg-[#F2F2F7] rounded-2xl border border-black/[0.03] group hover:bg-[#E5E5EA] transition-all"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-black text-[#1C1C1E] truncate pr-4">{plan.title}</h4>
                      <button 
                        onClick={() => deletePlan(plan.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-ios-gray hover:text-ios-red transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-ios-gray font-medium line-clamp-2 mb-2">{plan.content.replace(/###\s+(.*)/, '')}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-ios-gray font-bold">
                        {plan.createdAt?.toDate ? new Date(plan.createdAt.toDate()).toLocaleDateString() : ''}
                      </span>
                      <button 
                        onClick={() => {
                          setMessages(prev => [...prev, {
                            role: 'assistant',
                            content: `저장된 계획을 불러올게요:\n\n${plan.content}`,
                            timestamp: new Date(),
                          }]);
                          if (window.innerWidth < 640) setShowHistory(false);
                        }}
                        className="text-[9px] font-black text-ios-blue flex items-center gap-1"
                      >
                        상세보기 <ChevronRight className="w-2 h-2" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="p-4 bg-[#F2F2F7]/50">
                <div className="p-3 bg-white rounded-2xl border border-black/5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-ios-blue/10 rounded-xl flex items-center justify-center">
                    <GraduationCap className="text-ios-blue w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#1C1C1E]">Study Points</p>
                    <p className="text-lg font-black text-ios-blue leading-none">{savedPlans.length * 10}P</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
