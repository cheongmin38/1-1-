import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, User, UserCheck, Trash2, Heart, Filter, AlertCircle, Laugh, Sparkles, Megaphone, Coffee } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  isAnonymous: boolean;
  category: 'funny' | 'improvement' | 'discomfort' | 'chat';
  createdAt: any;
  likes: number;
  likedBy?: string[];
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  isAnonymous: boolean;
  createdAt: any;
  likes?: number;
}

const CATEGORIES = [
  { id: 'all', label: '전체', icon: MessageSquare },
  { id: 'popular', label: '🔥 인기글', icon: Heart },
  { id: 'funny', label: '오늘 웃긴일', icon: Laugh },
  { id: 'improvement', label: '개선할 점', icon: Sparkles },
  { id: 'discomfort', label: '불편한 점', icon: AlertCircle },
  { id: 'chat', label: '자유 소통', icon: Coffee },
];

export default function FreeBoard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [category, setCategory] = useState<Post['category']>('chat');
  const [filter, setFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const studentId = localStorage.getItem('student_id') || 'unknown';
  const studentName = localStorage.getItem('student_name') || '익명';

  useEffect(() => {
    const q = query(collection(db, 'free_board'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(newPosts);
    }, (error) => {
      console.error("FreeBoard posts load error:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'free_board'), {
        content: content.trim(),
        authorId: studentId,
        authorName: studentName,
        isAnonymous,
        category,
        createdAt: serverTimestamp(),
        likes: 0
      });
      setContent('');
    } catch (error) {
      console.error("Error adding post:", error);
      alert("게시글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendNotification = async (targetUserId: string, title: string, body: string, type: 'comment' | 'like') => {
    if (targetUserId === studentId) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        targetUserId,
        title,
        body,
        type,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    } catch (e) { console.error(e); }
  };

  const handleLike = async (post: Post) => {
    if ("vibrate" in navigator) navigator.vibrate(50);
    try {
      await updateDoc(doc(db, 'free_board', post.id), {
        likes: increment(1)
      });
      if (post.likes % 5 === 0) {
        sendNotification(post.authorId, "내 글이 인기가 많아요!", `${post.content.substring(0, 20)}...`, 'like');
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleCommentLike = async (postId: string, commentId: string) => {
    if ("vibrate" in navigator) navigator.vibrate(50);
    try {
      await updateDoc(doc(db, `free_board/${postId}/comments`, commentId), {
        likes: increment(1)
      });
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };
  const handleCommentSubmit = async (postId: string, postAuthorId: string, postContent: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    try {
      await addDoc(collection(db, `free_board/${postId}/comments`), {
        authorId: studentId,
        authorName: studentName,
        content: text,
        isAnonymous,
        createdAt: serverTimestamp(),
      });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      sendNotification(postAuthorId, "새로운 댓글이 달렸어요!", `${postContent.substring(0, 20)}... 에 댓글이 달렸습니다.`, 'comment');
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!selectedPostId) return;
    const q = query(collection(db, `free_board/${selectedPostId}/comments`), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[];
      setComments(prev => ({ ...prev, [selectedPostId]: docs }));
    }, (error) => {
      console.error(`Comments load error for post ${selectedPostId}:`, error);
    });
    return () => unsubscribe();
  }, [selectedPostId]);

  const handleDelete = async (postId: string, authorId: string) => {
    if (authorId !== studentId && studentId !== '0') {
      alert("직접 작성한 글만 삭제할 수 있습니다.");
      return;
    }

    if (window.confirm("정말로 이 글을 삭제하시겠습니까?")) {
      try {
        await deleteDoc(doc(db, 'free_board', postId));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : filter === 'popular'
      ? [...posts].filter(p => p.likes >= 3).sort((a, b) => b.likes - a.likes)
      : posts.filter(p => p.category === filter);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-[#1C1C1E] tracking-tight flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Megaphone className="w-8 h-8 text-ios-blue" />
          </motion.div>
          우리반 자유 게시판
        </h2>
        <p className="text-ios-gray font-medium">우리만의 소통 공간! 자유롭게 이야기해봐요.</p>
      </div>

      {/* Writing Section */}
      <div className="ios-card p-6 bg-white shadow-sm border border-black/5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {(CATEGORIES.filter(c => !['all', 'popular'].includes(c.id)) as any[]).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5",
                  category === cat.id 
                    ? "bg-ios-blue text-white shadow-md shadow-ios-blue/20" 
                    : "bg-[#F2F2F7] text-ios-gray hover:bg-[#E5E5EA]"
                )}
              >
                <cat.icon className="w-3 h-3" />
                {cat.label}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="불편한 점, 웃긴 일, 무엇이든 적어주세요..."
            className="w-full h-32 p-4 bg-[#F2F2F7] rounded-2xl text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-ios-blue/30 transition-all resize-none"
          />

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                isAnonymous ? "text-ios-blue" : "text-ios-gray"
              )}
            >
              {isAnonymous ? <UserCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
              <span className="text-xs font-black uppercase tracking-widest">
                {isAnonymous ? '익명 모드 ON' : '실명 모드'}
              </span>
            </button>

            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="bg-ios-blue text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-ios-blue/20 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
            >
              {isSubmitting ? '작성 중...' : '게시하기'}
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black transition-all border",
              filter === cat.id
                ? "bg-[#1C1C1E] text-white border-[#1C1C1E]"
                : "bg-white text-ios-gray border-black/5 hover:bg-[#F2F2F7]"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="ios-card p-5 bg-white border border-black/5 hover:border-black/10 transition-colors group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white",
                    post.isAnonymous ? "bg-ios-gray" : "bg-ios-blue"
                  )}>
                    {post.isAnonymous ? <User className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black leading-none">
                      {post.isAnonymous ? '익명 학생' : post.authorName}
                    </span>
                    <span className="text-[10px] text-ios-gray font-bold uppercase mt-0.5">
                      {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleString('ko-KR', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : '작성 중...'}
                    </span>
                  </div>
                </div>
                
                <div className={cn(
                  "px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter",
                  post.category === 'funny' ? "bg-yellow-100 text-yellow-700" :
                  post.category === 'improvement' ? "bg-blue-100 text-blue-700" :
                  post.category === 'discomfort' ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                )}>
                  {CATEGORIES.find(c => c.id === post.category)?.label}
                </div>
              </div>

              <p className="text-[#1C1C1E] font-medium text-[15px] leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>

              <div className="flex items-center justify-between mt-4 border-t border-black/[0.03] pt-3">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleLike(post)}
                    className="flex items-center gap-1.5 text-ios-gray hover:text-ios-red transition-all active:scale-125 group/like"
                  >
                    <Heart className={cn(
                      "w-4 h-4 transition-all", 
                      post.likes > 0 ? "fill-ios-red text-ios-red" : "group-hover/like:text-ios-red"
                    )} />
                    <span className={cn("text-xs font-black", post.likes > 0 && "text-ios-red")}>{post.likes}</span>
                  </button>

                  <button 
                    onClick={() => setSelectedPostId(selectedPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 text-ios-gray hover:text-ios-blue transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-black">댓글</span>
                  </button>
                </div>

                {(post.authorId === studentId || studentId === '0') && (
                  <button 
                    onClick={() => handleDelete(post.id, post.authorId)}
                    className="opacity-0 group-hover:opacity-100 text-ios-gray hover:text-ios-red transition-all p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Comment Section */}
              <AnimatePresence>
                {selectedPostId === post.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-black/[0.03] space-y-4">
                      {/* Comment List */}
                      <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                        {comments[post.id]?.map((c) => (
                          <div key={c.id} className="flex gap-2">
                            <div className={cn(
                              "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0",
                              c.isAnonymous ? "bg-gray-100 text-ios-gray" : "bg-ios-blue/10 text-ios-blue"
                            )}>
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 bg-[#F2F2F7]/50 rounded-2xl p-2.5">
                              <div className="flex justify-between items-start mb-0.5">
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-black">{c.isAnonymous ? '익명' : c.authorName}</span>
                                  <span className="text-[9px] text-ios-gray font-bold">
                                    {c.createdAt?.toDate ? new Date(c.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => handleCommentLike(post.id, c.id)}
                                  className="flex items-center gap-1 text-ios-gray hover:text-ios-red transition-all active:scale-150"
                                >
                                  <Heart className={cn("w-3 h-3", (c.likes || 0) > 0 ? "fill-ios-red text-ios-red" : "")} />
                                  <span className={cn("text-[10px] font-black", (c.likes || 0) > 0 && "text-ios-red")}>{c.likes || 0}</span>
                                </button>
                              </div>
                              <p className="text-[13px] text-[#1C1C1E] font-medium leading-relaxed">{c.content}</p>
                            </div>
                          </div>
                        ))}
                        {(!comments[post.id] || comments[post.id].length === 0) && (
                          <p className="text-center py-4 text-[11px] text-ios-gray font-bold">
                            첫 댓글을 남겨보세요!
                          </p>
                        )}
                      </div>

                      {/* Comment Input */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleCommentSubmit(post.id, post.authorId, post.content);
                        }}
                        className="flex items-center gap-2"
                      >
                        <input 
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="댓글을 입력하세요..."
                          className="flex-1 bg-[#F2F2F7] rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ios-blue/30"
                        />
                        <button 
                          type="submit"
                          disabled={!commentInputs[post.id]?.trim()}
                          className="p-2 bg-ios-blue text-white rounded-lg disabled:opacity-50 transition-all active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-ios-gray"
          >
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold">
              {filter === 'popular' 
                ? '아직 인기글(좋아요 3개 이상)이 없습니다. 공감을 더 눌러주세요!' 
                : '아직 게시글이 없습니다. 첫 글을 남겨보세요!'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
