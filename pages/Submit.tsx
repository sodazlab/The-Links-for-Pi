import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { PiService } from '../services/pi';
import { CheckCircle, AlertCircle, Loader2, Save, Wallet, ShieldCheck, Play, Instagram, FileText, Link as LinkIcon, AtSign } from 'lucide-react';
import { PostCategory, Post } from '../types';
import Modal from '../components/Modal';

// Custom X Logo
const XLogoIcon = ({ size = 14 }: { size?: number }) => (
  <svg 
    viewBox="0 0 24 24" 
    aria-hidden="true" 
    width={size} 
    height={size} 
    className="fill-current"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const CATEGORY_OPTIONS: { id: PostCategory; label: string; icon: React.ElementType }[] = [
  { id: 'youtube', label: 'YouTube', icon: Play },
  { id: 'x', label: 'X', icon: XLogoIcon },
  { id: 'threads', label: 'Threads', icon: AtSign },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'article', label: 'Article', icon: FileText },
  { id: 'other', label: 'Other', icon: LinkIcon },
];

const Submit: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const editModePost = location.state?.post as Post | undefined;
  const isEditMode = !!editModePost;
  const isAdmin = user?.role === 'admin';

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
    
    // Improved Auto-detection Logic
    if (lowerVal.includes('youtube.com') || lowerVal.includes('youtu.be')) {
      setDetectedCategory('youtube');
    } else if (lowerVal.includes('twitter.com') || lowerVal.includes('x.com')) {
      setDetectedCategory('x');
    } else if (lowerVal.includes('instagram.com')) {
      setDetectedCategory('instagram');
    } else if (lowerVal.includes('threads.net')) {
      setDetectedCategory('threads');
    } else {
      setDetectedCategory('other');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;
    
    setIsSubmitting(true);
    let isPaymentComplete = false;

    try {
      // 1단계: 결제 검문소 (수정 모드나 관리자가 아닐 때만 실행)
      if (!isEditMode && !isAdmin) {
        setPaymentStatus('pending_payment');
        try {
          // 중요: createPayment가 완료될 때까지 await가 기다립니다.
          // 사용자가 취소하거나 서버 승인이 실패하면 여기서 에러가 발생해 catch문으로 빠집니다.
          await PiService.createPayment(`temp_${Date.now()}`, title);
          isPaymentComplete = true; 
        } catch (payErr: any) {
          // 결제 실패 시 즉시 중단
          const isCancel = payErr.message === 'PAYMENT_CANCELLED';
          setModal({
            isOpen: true,
            title: isCancel ? 'Payment Cancelled' : 'Payment Error',
            message: isCancel 
              ? 'You must complete the Pi payment to submit your link.' 
              : 'The payment process failed on the server. Please try again.',
            type: 'warning'
          });
          setIsSubmitting(false);
          setPaymentStatus('idle');
          return; // 함수 종료! (DB 저장 코드로 못 내려가게 막음)
        }
      } else {
        isPaymentComplete = true; // 관리자나 수정은 프리패스
      }

      // 2단계: 실제 DB 저장 (결제가 완료된 경우만 이 지점에 도달함)
      if (isPaymentComplete) {
        setPaymentStatus('saving');
        const result = isEditMode && editModePost 
          ? await db.updatePost(editModePost.id, { title, description, url, category: detectedCategory })
          : await db.createPost({ userId: user.id, username: user.username, title, description, url, category: detectedCategory });

        if (result.error) throw new Error('Failed to save to database.');

        setModal({
          isOpen: true,
          title: 'Success!',
          message: 'Your link has been submitted successfully.',
          type: 'success',
          onClose: () => {
            navigate('/');
            window.location.reload();
          }
        });
      }
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: 'Error',
        message: err.message || 'An unexpected error occurred.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
      setPaymentStatus('idle');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-[#16161e] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-[#0f0f12]/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
            <div className="w-24 h-24 mb-8 relative">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
              {paymentStatus === 'pending_payment' ? (
                <Wallet className="absolute inset-0 m-auto text-purple-400 w-10 h-10 animate-pulse" />
              ) : (
                <Loader2 className="absolute inset-0 m-auto text-purple-400 w-10 h-10 animate-spin" />
              )}
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase">
              {paymentStatus === 'pending_payment' ? 'Waiting for Payment...' : 'Saving...'}
            </h3>
            <p className="text-gray-400 text-sm">
              {paymentStatus === 'pending_payment' 
                ? 'Please complete the transaction in your Pi Wallet. The wallet will open shortly.' 
                : 'Confirming your payment and saving data...'}
            </p>
          </div>
        )}

        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl font-black text-white">{isEditMode ? 'Edit Link' : 'Submit Link'}</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">Curation Fee: 1 Pi</p>
          </div>
          {!isEditMode && !isAdmin && (
             <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl px-5 py-2.5 flex items-center gap-2">
                <Wallet className="text-purple-400 w-4 h-4" />
                <span className="font-black text-[11px] uppercase text-purple-400">1 Pi Required</span>
             </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">URL</label>
            <input type="url" required value={url} onChange={handleUrlChange} placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-purple-500 transition" />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = detectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setDetectedCategory(cat.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border
                      ${isSelected 
                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20' 
                        : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={14} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-purple-500 transition" />
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Description</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={4} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-purple-500 transition resize-none" />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition shadow-2xl disabled:opacity-50">
            {isSubmitting ? 'Processing...' : isEditMode ? 'Update' : 'Pay 1 Pi & Submit'}
          </button>
        </form>
      </div>

      <Modal isOpen={modal.isOpen} onClose={() => { setModal(prev => ({ ...prev, isOpen: false })); if(modal.onClose) modal.onClose(); }} type={modal.type as any} title={modal.title} message={modal.message} />
    </div>
  );
};

export default Submit;