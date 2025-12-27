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
      // 1. Payment process for new submissions (Only for non-admins)
      if (!isEditMode && !isAdmin) {
        setPaymentStatus('pending_payment');
        try {
          const tempId = `temp_${Date.now()}`;
          await PiService.createPayment(tempId, title);
          console.log('Payment Successful');
        } catch (payErr: any) {
          setModal({
            isOpen: true,
            title: 'Payment Incomplete',
            message: payErr.message || 'The 1 Pi payment was not completed. Standard users must pay a fee to publish new links.',
            type: 'warning'
          });
          setIsSubmitting(false);
          setPaymentStatus('idle');
          return;
        }
      } else if (!isEditMode && isAdmin) {
        console.log('Admin detected. Bypassing payment step.');
      }

      // 2. Database Save
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
        throw new Error(typeof result.error === 'string' ? result.error : 'Failed to save to database.');
      } else {
        setModal({
          isOpen: true,
          title: isEditMode ? 'Update Successful' : 'Publish Successful',
          message: isEditMode 
            ? 'The link metadata has been successfully updated.' 
            : `Submission completed ${isAdmin ? '(Admin override)' : 'with 1 Pi payment'}. It will be visible on the feed after moderation.`,
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
        title: 'Error Occurred',
        message: err?.message || 'Something went wrong while processing your request.',
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
          <h2 className="text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-gray-400 mt-2 mb-4">Please connect your Pi wallet first to share links with the community.</p>
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
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">
              {paymentStatus === 'pending_payment' ? 'Approving Payment...' : 'Syncing Data...'}
            </h3>
            <p className="text-gray-500 text-sm font-medium">
              {paymentStatus === 'pending_payment' 
                ? 'Check your Pi Wallet to confirm the 1 Pi transaction.' 
                : 'Finalizing your submission. One moment please.'}
            </p>
          </div>
        )}

        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white">{isEditMode ? 'Edit Content' : 'Publish Link'}</h1>
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{isEditMode ? 'Update Shared Info' : 'Curation Submission'}</p>
          </div>
          {!isEditMode && (
            <div className={`border rounded-2xl px-4 py-2 flex items-center gap-2 ${isAdmin ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
              {isAdmin ? <ShieldCheck className="text-emerald-400 w-4 h-4" /> : <Wallet className="text-purple-400 w-4 h-4" />}
              <span className={`font-black text-xs ${isAdmin ? 'text-emerald-400' : 'text-purple-400'}`}>
                {isAdmin ? 'Admin: Free' : '1 Pi Fee'}
              </span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 ml-1">Destination URL</label>
            <input 
              type="url" 
              required 
              value={url} 
              onChange={handleUrlChange} 
              placeholder="https://..." 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 transition shadow-inner" 
            />
            <div className="flex items-center gap-2 mt-2 ml-1">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Detected:</span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${detectedCategory !== 'other' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                {detectedCategory}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 ml-1">Display Title</label>
            <input 
              type="text" 
              required 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Pi Network Node Update" 
              maxLength={60} 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 transition shadow-inner" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 ml-1">Description</label>
            <textarea 
              required 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="What makes this link valuable to Pioneers?" 
              rows={4} 
              maxLength={200} 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 transition resize-none shadow-inner" 
            />
          </div>
          
          {!isEditMode && !isAdmin && (
            <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
              <p className="text-[10px] text-yellow-500/70 leading-relaxed font-medium uppercase tracking-tight">
                * Standard submissions require a 1 Pi fee. This helps prevent spam and maintains community quality.
              </p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition shadow-xl ${isSubmitting ? 'bg-gray-800 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-purple-900/20'}`}
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing</>
            ) : (
              <>
                {isEditMode ? <Save className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                {isEditMode ? 'Update Post' : isAdmin ? 'Publish Now (Admin)' : 'Pay 1 Pi & Publish'}
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