import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { PiService } from '../services/pi';
import { CheckCircle, AlertCircle, Loader2, Save, Wallet, ShieldCheck } from 'lucide-react';
import { PostCategory, Post } from '../types';
import Modal from '../components/Modal';

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

  // Unified modal state to prevent state collision
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

  const closeAndReset = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;
    
    setIsSubmitting(true);
    let proceedToSave = false;
    
    try {
      // PHASE 1: PAYMENT (Mandatory for non-admins on new posts)
      if (!isEditMode && !isAdmin) {
        setPaymentStatus('pending_payment');
        try {
          const tempId = `temp_${Date.now()}`;
          await PiService.createPayment(tempId, title);
          proceedToSave = true; // Payment handshake succeeded
        } catch (payErr: any) {
          const isCancel = payErr.message === 'PAYMENT_CANCELLED';
          setIsSubmitting(false);
          setPaymentStatus('idle');
          
          setModal({
            isOpen: true,
            title: isCancel ? 'Payment Cancelled' : 'Payment Failed',
            message: isCancel 
              ? 'You cancelled the 1 Pi payment. Submission cannot proceed without payment.' 
              : 'The Pi Wallet encountered an error. Please ensure you are using the Pi Browser.',
            type: isCancel ? 'info' : 'warning',
            onClose: closeAndReset
          });
          return; // STOP EXECUTION: DO NOT SAVE TO DB
        }
      } else {
        // Admins or Edit mode always proceed
        proceedToSave = true;
      }

      // PHASE 2: DATABASE SAVING
      if (proceedToSave) {
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
          throw new Error('Database Error: Could not save your entry.');
        } else {
          setModal({
            isOpen: true,
            title: 'Submission Successful',
            message: isEditMode 
              ? 'Changes saved successfully.' 
              : 'Your link has been submitted and is awaiting moderation.',
            type: 'success',
            onClose: () => {
              navigate('/');
              window.location.reload();
            }
          });
        }
      }
    } catch (err: any) {
      console.error('[Submit] Critical Failure:', err);
      setModal({
        isOpen: true,
        title: 'System Error',
        message: err?.message || 'A technical issue occurred. Please try again later.',
        type: 'error',
        onClose: closeAndReset
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
          <h2 className="text-2xl font-black text-white">ACCESS DENIED</h2>
          <p className="text-gray-400 mt-2 mb-4">Please log in through the Pi Browser to contribute links.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="bg-[#16161e] border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Progress Overlay */}
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
            <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">
              {paymentStatus === 'pending_payment' ? 'Opening Pi Wallet...' : 'Syncing Data...'}
            </h3>
            <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">
              {paymentStatus === 'pending_payment' 
                ? 'Please authorize the curation fee in your Pi Wallet. If the wallet doesn\'t open, verify your connection.' 
                : 'Writing your submission to the community ledger. Please stay on this page.'}
            </p>
          </div>
        )}

        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{isEditMode ? 'Edit Link' : 'Submit Link'}</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Community Curation Platform</p>
          </div>
          {!isEditMode && (
            <div className={`border rounded-2xl px-5 py-2.5 flex items-center gap-2 ${isAdmin ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
              {isAdmin ? <ShieldCheck className="text-emerald-400 w-4 h-4" /> : <Wallet className="text-purple-400 w-4 h-4" />}
              <span className={`font-black text-[11px] uppercase tracking-widest ${isAdmin ? 'text-emerald-400' : 'text-purple-400'}`}>
                {isAdmin ? 'Admin Override: Free' : 'Fee: 1 Pi'}
              </span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8 mt-10">
          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Destination URL</label>
            <input 
              type="url" 
              required 
              value={url} 
              onChange={handleUrlChange} 
              placeholder="https://example.com" 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-gray-700 shadow-inner" 
            />
            <div className="flex items-center gap-2 mt-2 ml-1">
              <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Category:</span>
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${detectedCategory !== 'other' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-gray-600 border-white/10'}`}>
                {detectedCategory}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Display Title</label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="What is this link about?" 
              maxLength={60} 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-gray-700 shadow-inner" 
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Description</label>
            <textarea 
              required 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Add some context for other Pioneers." 
              rows={4} 
              maxLength={200} 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-purple-500 transition-all resize-none placeholder:text-gray-700 shadow-inner" 
            />
          </div>
          
          {!isEditMode && !isAdmin && (
            <div className="p-5 bg-yellow-500/5 border border-yellow-500/10 rounded-[2rem] flex gap-4">
              <AlertCircle size={20} className="text-yellow-500/40 shrink-0" />
              <p className="text-[11px] text-yellow-500/60 leading-relaxed font-bold uppercase tracking-tight">
                Standard Pioneers are charged 1 Pi to publish new content. This keeps the feed high-quality and free of spam.
              </p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-2xl ${isSubmitting ? 'bg-gray-800 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[1.01] active:scale-95 shadow-purple-900/30 text-white'}`}
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <>
                {isEditMode ? <Save className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                {isEditMode ? 'Update Entry' : isAdmin ? 'Publish Now' : 'Pay 1 Pi & Publish'}
              </>
            )}
          </button>
        </form>
      </div>

      <Modal 
        isOpen={modal.isOpen}
        onClose={() => {
          if (modal.onClose) {
            modal.onClose();
          } else {
            closeAndReset();
          }
        }}
        type={modal.type as any}
        title={modal.title}
        message={modal.message}
        confirmText="Acknowledge"
      />
    </div>
  );
};

export default Submit;