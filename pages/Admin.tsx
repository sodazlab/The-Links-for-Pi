import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { Post, PostStatus } from '../types';
import { Check, X, Clock, KeyRound, Loader2, Trash2, CheckCircle, AlertTriangle, ExternalLink, RefreshCw, LayoutList, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Custom Confirmation Modal Component ---
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, isDestructive }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={isProcessing ? undefined : onClose}
      />
      
      {/* Modal Content */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="relative bg-[#1e1e24] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className={`absolute top-0 left-0 w-full h-1 ${isDestructive ? 'bg-red-500' : 'bg-purple-500'}`} />
        
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-full shrink-0 ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-purple-500/10 text-purple-500'}`}>
            {isDestructive ? <AlertOctagon size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        
        <div className="flex gap-3 justify-end mt-6">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-lg flex items-center gap-2 disabled:opacity-70 ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' 
                : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'
            }`}
          >
            {isProcessing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isDestructive ? (
              'Delete'
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Admin Component ---
const Admin: React.FC = () => {
  const { user, loginAsAdmin } = useAuth();
  
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<PostStatus>('pending');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDestructive: false,
    onConfirm: async () => {},
  });

  // Load posts whenever user or active tab changes
  useEffect(() => {
    if (user?.role === 'admin') {
      loadPosts();
    }
  }, [user, activeTab]);

  const loadPosts = async () => {
    setLoading(true);
    const data = await db.getPostsByStatus(activeTab);
    setPosts(data);
    setLoading(false);
  };

  const handleRefresh = () => {
    loadPosts();
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleStatusChange = async (id: string, newStatus: PostStatus) => {
    // Optimistic update
    const originalPosts = [...posts];
    setPosts(prev => prev.filter(p => p.id !== id));
    
    const error = await db.updatePostStatus(id, newStatus);
    if (error) {
      alert(`Failed to update status: ${typeof error === 'string' ? error : 'Unknown error'}`);
      setPosts(originalPosts); // Revert UI
    }
  };

  const handleDelete = (id: string) => {
    setModal({
      isOpen: true,
      title: 'Delete Permanently?',
      message: 'This action cannot be undone. The post will be removed from the database forever.',
      isDestructive: true,
      onConfirm: async () => {
        // 1. Optimistic UI update
        const originalPosts = [...posts];
        setPosts(prev => prev.filter(p => p.id !== id));
        
        // 2. Database deletion
        const { error } = await db.deletePost(id);
        
        if (error) {
          console.error("Actual deletion failed:", error);
          alert("Deletion failed in database. Restoring post to view.");
          setPosts(originalPosts); // Rollback UI if failed
        }
      }
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'pnc123') {
      loginAsAdmin();
      setError('');
    } else {
      setError('Invalid PIN.');
      setPassword('');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4 animate-fade-in-up">
        <div className="w-full max-w-sm bg-[#16161e] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <KeyRound className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Access</h1>
            <p className="text-gray-500 mt-2 text-sm">Restricted area for moderators.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PIN"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-center text-white text-lg tracking-[0.5em] focus:outline-none focus:border-purple-500 transition placeholder:text-gray-600 placeholder:tracking-normal placeholder:text-sm"
                autoFocus
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-xs text-center font-medium animate-pulse">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-900/20 text-sm"
            >
              Verify
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
             <span className="text-[10px] uppercase text-gray-600 tracking-wider">Secure Environment</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-10 animate-fade-in-up pb-24 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <LayoutList className="text-purple-400" />
            Moderation
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage community submissions</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth">
          {(['pending', 'approved', 'rejected'] as PostStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`
                flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize whitespace-nowrap
                ${activeTab === status 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span>Showing {posts.length} {activeTab} posts</span>
          <button onClick={handleRefresh} className="flex items-center gap-1 hover:text-purple-400 transition" title="Refresh">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading posts...</p>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="py-16 text-center bg-[#16161e] rounded-2xl border border-white/5 border-dashed">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
               {activeTab === 'pending' ? <CheckCircle className="text-gray-600" /> : <Clock className="text-gray-600" />}
            </div>
            <p className="text-gray-400 font-medium">No {activeTab} posts found.</p>
          </div>
        )}

        {!loading && posts.map(post => (
          <div 
            key={post.id} 
            className="group bg-[#1a1a20] border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all duration-300 shadow-sm hover:shadow-md hover:bg-[#202026]"
          >
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border border-white/5 shadow-inner ${
                    activeTab === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    activeTab === 'approved' ? 'bg-green-500/10 text-green-500' :
                    'bg-red-500/10 text-red-500'
                }`}>
                  {activeTab === 'pending' && <Clock size={20} />}
                  {activeTab === 'approved' && <CheckCircle size={20} />}
                  {activeTab === 'rejected' && <AlertTriangle size={20} />}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase tracking-wide border border-white/5">
                      {post.category}
                    </span>
                    <span className="text-[10px] text-gray-500">by {post.username}</span>
                  </div>
                  <h3 className="font-bold text-white text-base pr-2 break-words">{post.title}</h3>
                  <p className="text-gray-400 text-sm mt-1 opacity-80 break-words">{post.description}</p>
                  <a href={post.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1.5 text-xs text-blue-400 mt-2 hover:text-blue-300 break-all">
                    <ExternalLink size={10} className="mt-[3px] shrink-0" />
                    <span>{post.url}</span>
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 w-full sm:w-auto sm:self-center border-t border-white/5 pt-3 sm:border-0 sm:pt-0 mt-1 sm:mt-0">
                {activeTab === 'pending' && (
                  <>
                    <button onClick={() => handleStatusChange(post.id, 'rejected')} className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-white/5 hover:text-red-400 border border-white/5 transition flex items-center justify-center gap-2 text-xs font-semibold">
                      <X size={16} /><span className="sm:hidden">Reject</span>
                    </button>
                    <button onClick={() => handleStatusChange(post.id, 'approved')} className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition flex items-center justify-center gap-2 text-xs font-semibold shadow-lg shadow-purple-900/20">
                      <Check size={16} /><span className="sm:hidden">Approve</span>
                    </button>
                  </>
                )}
                {activeTab === 'approved' && (
                  <>
                    <button onClick={() => handleStatusChange(post.id, 'rejected')} className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-white/5 hover:text-yellow-400 border border-white/5 transition flex items-center justify-center gap-2 text-xs font-semibold">
                      <X size={16} /><span className="sm:hidden">Unpublish</span>
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="flex-1 sm:flex-none h-10 w-10 rounded-xl bg-white/5 hover:text-red-400 border border-white/5 transition flex items-center justify-center">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                {activeTab === 'rejected' && (
                  <>
                    <button onClick={() => handleStatusChange(post.id, 'pending')} className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-white/5 hover:text-purple-400 border border-white/5 transition flex items-center justify-center gap-2 text-xs font-semibold">
                      <RefreshCw size={16} /><span className="sm:hidden">Restore</span>
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="flex-1 sm:flex-none h-10 w-10 rounded-xl bg-white/5 hover:text-red-400 border border-white/5 transition flex items-center justify-center">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {modal.isOpen && (
          <ConfirmModal 
            isOpen={modal.isOpen}
            title={modal.title}
            message={modal.message}
            isDestructive={modal.isDestructive}
            onConfirm={modal.onConfirm}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;