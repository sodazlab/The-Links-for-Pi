import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { PiService } from '../services/pi';
import { Loader2, Wallet, Play, Instagram, FileText, Link as LinkIcon, AtSign, ChevronDown, Type, AlignLeft, Globe, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { PostCategory, Post } from '../types';
import Modal from '../components/Modal';

// Custom X Logo
const XLogoIcon = ({ size = 14, className }: { size?: number, className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    aria-hidden="true" 
    width={size} 
    height={size} 
    className={`fill-current ${className || ''}`}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const CATEGORY_OPTIONS: { id: PostCategory; label: string; icon: React.ElementType }[] = [
  { id: 'youtube', label: 'YouTube', icon: Play },
  { id: 'x', label: 'X (Twitter)', icon: XLogoIcon },
  { id: 'threads', label: 'Threads', icon: AtSign },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'article', label: 'Article / Blog', icon: FileText },
  { id: 'other', label: 'Other Website', icon: LinkIcon },
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
          await PiService.createPayment(`temp_${Date.now()}`, title);
          isPaymentComplete = true; 
        } catch (payErr: any) {
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
          return;
        }
      } else {
        isPaymentComplete = true;
      }

      // 2단계: 실제 DB 저장
      if (isPaymentComplete) {
        setPaymentStatus('saving');
        const result = isEditMode && editModePost 
          ? await db.updatePost(editModePost.id, { title, description, url, category: detectedCategory })
          : await db.createPost({ userId: user.id, username: user.username, title, description, url, category: detectedCategory });

        if (result.error) throw new Error('Failed to save to database.');

        setModal({
          isOpen: true,
          title: 'Submission Received!',
          // Updated success message with English explanation about admin review
          message: 'Your link has been submitted successfully. It will be published after admin review.',
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

  // Safe safe UI for unauthenticated state
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-4 bg-white/5 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-gray-400 mb-6 text-sm">Please connect your wallet to submit or edit links.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition border border-white/10"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Determine the icon component for the detected category
  const SelectedIcon = CATEGORY_OPTIONS.find(c => c.id === detectedCategory)?.icon || LinkIcon;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <div className="bg-[#16161e] border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden mb-10">
        
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-[#0f0f12]/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
              {paymentStatus === 'pending_payment' ? (
                <Wallet className="absolute inset-0 m-auto text-purple-400 w-8 h-8 animate-pulse" />
              ) : (
                <Loader2 className="absolute inset-0 m-auto text-purple-400 w-8 h-8 animate-spin" />
              )}
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-wide">
              {paymentStatus === 'pending_payment' ? 'Waiting for Payment...' : 'Saving...'}
            </h3>
            <p className="text-gray-400 text-xs">
              {paymentStatus === 'pending_payment' 
                ? 'Please confirm the transaction in your Pi Wallet.' 
                : 'Finalizing your submission...'}
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-black text-white">{isEditMode ? 'Edit Link' : 'Submit Link'}</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Share with the Pi Community</p>
          </div>
          {!isEditMode && !isAdmin && (
             <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-2 flex items-center gap-2 self-start md:self-auto">
                <Wallet className="text-purple-400 w-4 h-4" />
                <span className="font-black text-[10px] uppercase text-purple-400 tracking-wider">Fee: 1 Pi</span>
             </div>
          )}
        </div>

        {/* Top Warning Banner */}
        <div className="mb-8 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
          <div className="text-xs text-yellow-200/80 leading-tight">
            <span className="font-black text-yellow-500 uppercase tracking-wider text-[10px] mr-1">Important:</span>
            Read the <strong className="text-yellow-100">Submission Policy</strong> below. Invalid posts are rejected without refund.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Link URL</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                <Globe size={18} />
              </div>
              <input 
                type="url" 
                required 
                value={url} 
                onChange={handleUrlChange} 
                placeholder="https://..." 
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm focus:outline-none focus:border-purple-500 focus:bg-white/5 transition placeholder:text-gray-600" 
              />
            </div>
          </div>

          {/* Category Select (Combo Box) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Category</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors pointer-events-none z-10">
                <SelectedIcon size={18} />
              </div>
              
              <select 
                value={detectedCategory} 
                onChange={(e) => setDetectedCategory(e.target.value as PostCategory)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-10 py-4 text-white text-sm appearance-none focus:outline-none focus:border-purple-500 focus:bg-white/5 transition cursor-pointer relative z-0"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-[#1a1a20] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Title</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                <Type size={18} />
              </div>
              <input 
                type="text" 
                required 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Enter a catchy title" 
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm focus:outline-none focus:border-purple-500 focus:bg-white/5 transition placeholder:text-gray-600" 
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Description</label>
            <div className="relative group">
              <div className="absolute left-4 top-6 text-gray-500 group-focus-within:text-purple-400 transition-colors">
                <AlignLeft size={18} />
              </div>
              <textarea 
                required 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="What is this link about?" 
                rows={4} 
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white text-sm focus:outline-none focus:border-purple-500 focus:bg-white/5 transition resize-none placeholder:text-gray-600" 
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-5 mt-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-purple-900/20 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? 'Processing...' : isEditMode ? 'Update Link' : 'Pay 1 Pi & Submit'}
          </button>
        </form>
      </div>

      {/* Submission Guidelines & Warning Section */}
      <div className="border border-orange-500/20 bg-orange-500/5 rounded-[2rem] p-6 md:p-8">
        <h3 className="flex items-center gap-2 text-orange-400 font-bold text-sm uppercase tracking-widest mb-4">
          <ShieldAlert size={18} />
          Submission Policy
        </h3>
        <ul className="space-y-4 text-xs md:text-sm text-gray-400 font-medium leading-relaxed">
          <li className="flex gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></span>
            <span>
              <strong className="text-gray-200">Anti-Spam Fee:</strong> A fee of 1 Pi is required for every submission to maintain high-quality content and prevent spam.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></span>
            <span>
              <strong className="text-gray-200">Admin Approval:</strong> Your post will not appear immediately. It will be published only after passing a manual review by our moderation team.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></span>
            <span>
              <strong className="text-gray-200">Content Quality:</strong> Links must be helpful to Pioneers and relevant to the Pi Network ecosystem. Purely promotional content, scams, or irrelevant links will be automatically deleted.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-pulse"></span>
            <span className="text-red-400/90">
              <strong className="text-red-400">NO REFUNDS:</strong> If your post is rejected due to violation of these guidelines, the 1 Pi fee will NOT be refunded. Please double-check your content suitability before paying.
            </span>
          </li>
        </ul>
      </div>

      <Modal isOpen={modal.isOpen} onClose={() => { setModal(prev => ({ ...prev, isOpen: false })); if(modal.onClose) modal.onClose(); }} type={modal.type as any} title={modal.title} message={modal.message} />
    </div>
  );
};

export default Submit;