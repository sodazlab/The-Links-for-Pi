import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { PostCategory } from '../types';

const Submit: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [detectedCategory, setDetectedCategory] = useState<PostCategory>('other');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect category
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    
    if (val.includes('youtube.com') || val.includes('youtu.be')) setDetectedCategory('youtube');
    else if (val.includes('twitter.com') || val.includes('x.com')) setDetectedCategory('x');
    else if (val.includes('threads.net')) setDetectedCategory('threads');
    else if (val.includes('instagram.com')) setDetectedCategory('instagram');
    else if (val.includes('medium.com') || val.includes('blog')) setDetectedCategory('article');
    else setDetectedCategory('other');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    console.log('Submitting post...');
    setIsSubmitting(true);
    
    try {
      const { error } = await db.createPost({
        userId: user.id,
        username: user.username,
        title,
        description,
        url,
        category: detectedCategory
      });

      if (error) {
        console.error('Submission error:', error);
        // Safely extract error message
        const errorMessage = error.message || error.error_description || error.details || JSON.stringify(error);
        alert(`Error submitting post: ${errorMessage}`);
      } else {
        console.log('Submission successful');
        // Small delay for UX
        setTimeout(() => {
          alert('Post submitted for approval!');
          navigate('/');
        }, 500);
      }
    } catch (err: any) {
      console.error('Unexpected error during submission:', err);
      const msg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
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
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="bg-[#16161e] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Submit a Link</h1>
        <p className="text-gray-400 mb-8">Share high-quality Pi Network content with the community.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Link URL</label>
            <div className="relative">
              <input 
                type="url" 
                required
                value={url}
                onChange={handleUrlChange}
                placeholder="https://..."
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
              />
              <div className="absolute right-3 top-3">
                <span className="text-xs uppercase bg-white/10 px-2 py-1 rounded text-gray-400 font-bold">
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
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit for Review
              </>
            )}
          </button>
          
          <p className="text-xs text-center text-gray-500">
            All submissions are reviewed by moderators before going live.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Submit;