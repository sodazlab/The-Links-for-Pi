import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { CheckCircle, AlertCircle, Loader2, Save } from 'lucide-react';
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

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
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
        const errorMessage = typeof result.error === 'object' && 'message' in result.error 
          ? (result.error as any).message 
          : JSON.stringify(result.error);
        
        setModal({
          isOpen: true,
          title: 'Error Occurred',
          message: errorMessage,
          type: 'error'
        });
      } else {
        setModal({
          isOpen: true,
          title: isEditMode ? 'Updated Successfully' : 'Submission Received',
          message: isEditMode 
            ? 'Your changes have been saved.' 
            : 'Your link has been sent for review and will be live once approved.',
          type: 'success',
          onClose: () => navigate('/')
        });
      }
    } catch (err: any) {
      setModal({
        isOpen: true,
        title: 'System Error',
        message: err?.message || 'Failed to communicate with the database.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center p-8 border border-white/10 rounded-[2rem] bg-white/5 backdrop-blur-md max-w-sm">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Access Denied</h2>
          <p className="text-gray-400 mt-2 mb-4">Pioneers must connect their wallet to share links with the community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="bg-[#16161e] border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">{isEditMode ? 'Edit Post' : 'Submit a Link'}</h1>
        <p className="text-gray-400 mb-8">{isEditMode ? 'Update your content details.' : 'Share high-quality Pi Network content.'}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 ml-1">Link URL</label>
            <input type="url" required value={url} onChange={handleUrlChange} placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 transition shadow-inner" />
            <div className="flex items-center gap-2 mt-2 ml-1">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Type:</span>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${detectedCategory !== 'other' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-gray-500 border-white/10'}`}>{detectedCategory}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 ml-1">Headline</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Eye-catching title..." maxLength={60} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 transition shadow-inner" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 ml-1">Short Description</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell the community why this is valuable..." rows={4} maxLength={200} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-purple-500 transition resize-none shadow-inner" />
          </div>
          <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition shadow-xl ${isSubmitting ? 'bg-gray-800 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-purple-900/20'}`}>
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />Processing...</> : <>{isEditMode ? <Save className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}{isEditMode ? 'Update Changes' : 'Publish Link'}</>}
          </button>
        </form>
      </div>

      <Modal 
        isOpen={modal.isOpen}
        onClose={() => {
          setModal(prev => ({ ...prev, isOpen: false }));
          if (modal.onClose) modal.onClose();
        }}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />
    </div>
  );
};

export default Submit;