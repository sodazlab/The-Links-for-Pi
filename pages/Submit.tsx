import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { PiService } from '../services/pi';
import { CheckCircle, AlertCircle, Loader2, Save, Wallet } from 'lucide-react';
import { PostCategory, Post } from '../types';
import Modal from '../components/Modal';

const Submit: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const editModePost = location.state?.post as Post | undefined;
  const isEditMode = !!editModePost;

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [detectedCategory, setDetectedCategory] = useState<PostCategory>('other');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending_payment' | 'saving'>('idle');

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onClose?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  useEffect(() => {
    if (editModePost) {
      setUrl(editModePost.url);
      setTitle(editModePost.title);
      setDescription(editModePost.description);
      setDetectedCategory(editModePost.category);
    }
  }, [editModePost]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    const lowerVal = val.toLowerCase();
    
    if (lowerVal.includes('youtube.com') || lowerVal.includes('youtu.be')) setDetectedCategory('youtube');
    else if (lowerVal.includes('twitter.com') || lowerVal.includes('x.com')) setDetectedCategory('x');
    else if (lowerVal.includes('threads.net') || lowerVal.includes('threads.com')) setDetectedCategory('threads');
    else if (lowerVal.includes('instagram.com')) setDetectedCategory('instagram');
    else if (lowerVal.includes('medium.com') || lowerVal.includes('blog') || lowerVal.includes('dev.to')) setDetectedCategory('article');
    else setDetectedCategory('other');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. 신규 등록일 경우 결제 먼저 진행
      if (!isEditMode) {
        setPaymentStatus('pending_payment');
        try {
          // 임시 ID 생성 (결제 메타데이터용)
          const tempId = `temp_${Date.now()}`;
          await PiService.createPayment(tempId, title);
          console.log('Payment Successful');
        } catch (payErr: any) {
          setModal({
            isOpen: true,
            title: '결제 실패 또는 취소',
            message: payErr.message || '1 Pi 결제가 완료되지 않았습니다. 게시물을 등록하려면 결제가 필요합니다.',
            type: 'warning'
          });
          setIsSubmitting(false);
          setPaymentStatus('idle');
          return;
        }
      }

      setPaymentStatus('saving');
      let result;
      if (isEditMode && editModePost) {
        result = await db.updatePost(editModePost.id, {
          title,
          description,
          url,
          category: detectedCategory
        });
      } else {
        result = await db.createPost({
          userId: user.id,
          username: user.username,
          title,
          description,
          url,
          category: detectedCategory
        });
      }

      if (result.error) {
        throw new Error(typeof result.error === 'string' ? result.error : '저장에 실패했습니다.');
      } else {
        setModal({
          isOpen: true,
          title: isEditMode ? '수정 완료' : '발행 완료',
          message: isEditMode 
            ? '게시물이 성공적으로 수정되었습니다.' 
            : '1 Pi 결제 및 제출이 완료되었습니다. 관리자 검토 후 리스트에 표시됩니다.',
          type: 'success',
          onClose: () => {
            window.location.href = '#/';
            window.location.reload();
          }
        });
      }
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: '오류 발생',
        message: err?.message || '처리 중 문제가 발생했습니다.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
      setPaymentStatus('idle');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center p-8 border border-white/10 rounded-[2rem] bg-white/5 backdrop-blur-md max-w-sm">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">접근 제한</h2>
          <p className="text-gray-400 mt-2 mb-4">커뮤니티와 링크를 공유하려면 먼저 Pi 지갑을 연결하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="bg-[#16161e] border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Progress Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-[#0f0f12]/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
              {paymentStatus === 'pending_payment' ? (
                <Wallet className="absolute inset-0 m-auto text-purple-400 w-8 h-8 animate-pulse" />
              ) : (
                <Loader2 className="absolute inset-0 m-auto text-purple-400 w-8 h-8 animate-spin" />
              )}
            </div>
            <h3 className="text-xl font-black text-white mb-2">
              {paymentStatus === 'pending_payment' ? 'Pi 지갑 결제 대기 중...' : '데이터 저장 중...'}
            </h3>
            <p className="text-gray-500 text-sm font-medium">
              {paymentStatus === 'pending_payment' 
                ? 'Pi 앱에서 결제 승인을 완료해 주세요. (1 Pi)' 
                : '거의 다 되었습니다. 잠시만 기다려 주세요.'}
            </p>
          </div>
        )}

        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">{isEditMode ? '수정하기' : '링크 공유하기'}</h1>
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{isEditMode ? 'Update Metadata' : 'New Submission'}</p>
          </div>
          {!isEditMode && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl px-4 py-2 flex items-center gap-2">
              <Wallet className="text-purple-400 w-4 h-4" />
              <span className="text-purple-400 font-black text-xs">1 Pi</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 ml-1">URL</label>
            <input type="url" required value={url} onChange={handleUrlChange} placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 transition shadow-inner" />
            <div className="flex items-center gap-2 mt-2 ml-1">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">detected:</span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${detectedCategory !== 'other' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-gray-500 border-white/10'}`}>{detectedCategory}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 ml-1">제목</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="제목을 입력하세요" maxLength={60} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 transition shadow-inner" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 ml-1">설명</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="링크에 대한 간단한 설명을 입력하세요" rows={4} maxLength={200} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 transition resize-none shadow-inner" />
          </div>
          
          {!isEditMode && (
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
              <p className="text-[10px] text-yellow-500/70 leading-relaxed font-medium">
                * 신규 링크 공유 시 커뮤니티 유지비용으로 1 Pi가 차감됩니다. 결제 완료 후 검토 프로세스가 시작됩니다.
              </p>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition shadow-xl ${isSubmitting ? 'bg-gray-800 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-purple-900/20'}`}>
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
            ) : (
              <>
                {isEditMode ? <Save className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                {isEditMode ? '수정 사항 저장' : '1 Pi 결제 후 발행'}
              </>
            )}
          </button>
        </form>
      </div>

      <Modal 
        isOpen={modal.isOpen}
        onClose={() => {
          setModal(prev => ({ ...prev, isOpen: false }));
          if (modal.onClose) modal.onClose();
        }}
        type={modal.type as any}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
};

export default Submit;