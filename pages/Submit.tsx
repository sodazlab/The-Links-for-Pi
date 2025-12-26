import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { CheckCircle, AlertCircle, Loader2, Save } from 'lucide-react';
import { PostCategory, Post } from '../types';

const Submit: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we are editing an existing post
  const editModePost = location.state?.post as Post | undefined;
  const isEditMode = !!editModePost;

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [detectedCategory, setDetectedCategory] = useState<PostCategory>('other');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form if in edit mode
  useEffect(() => {
    if (editModePost) {
      setUrl(editModePost.url);
      setTitle(editModePost.title);
      setDescription(editModePost.description);
      setDetectedCategory(editModePost.category);
    }
  }, [editModePost]);

  // Auto-detect category
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
        // Update existing post
        result = await db.updatePost(editModePost.id, {
          title,
          description,
          url,
          category: detectedCategory
        });
      } else {
        // Create new post
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
        console.error('Submission error:', result.error);
        const errorMessage = typeof result.error === 'object' && 'message' in result.error 
          ? (result.error as any).message 
          : JSON.stringify(result.error);
        alert(`Error: ${errorMessage}`);
      } else {
        // Small delay for UX
        setTimeout(() => {
          alert(isEditMode ? 'Post updated successfully!' : 'Post submitted for approval!');
          navigate('/');
        }, 500);
      }
    } catch (err: any) {
      console.error('Unexpected error during submission:', err);
      const msg = err?.message || String(err);
      alert(`An unexpected error occurred: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-gray-400 mt-2 mb-4">You must verify your wallet to submit links.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 animate-fade-in-up">
      <div className="bg-[#16161e] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">
          {isEditMode ? 'Edit Post' : 'Submit a Link'}
        </h1>
        <p className="text-gray-400 mb-8">
          {isEditMode ? 'Update your content details.' : 'Share high-quality Pi Network content with the community.'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Link URL</label>
            <div className="flex flex-col gap-3">
              <input 
                type="url" 
                required
                value={url}
                onChange={handleUrlChange}
                placeholder="https://..."
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
              />
              
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-sm text-gray-500">Detected Category:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border transition-all duration-300 ${
                  detectedCategory !== 'other' 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                    : 'bg-white/5 text-gray-500 border-white/10'
                }`}>
                  {detectedCategory === 'x' ? 'X (Twitter)' : detectedCategory}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is this content about?"
              maxLength={60}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Description</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief summary..."
              rows={4}
              maxLength={200}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition ${isSubmitting ? 'bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isEditMode ? 'Updating...' : 'Submitting...'}
              </>
            ) : (
              <>
                {isEditMode ? <Save className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                {isEditMode ? 'Update Post' : 'Submit for Review'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Submit;