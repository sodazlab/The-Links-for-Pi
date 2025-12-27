import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { Post, PostStatus } from '../types';
import { Check, X, Clock, KeyRound, Loader2, Trash2, CheckCircle, AlertTriangle, ExternalLink, RefreshCw, LayoutList } from 'lucide-react';
import Modal from '../components/Modal';

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
    type: 'confirm' | 'error' | 'success';
    showCancel?: boolean;
    onConfirm?: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm'
  });

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

  const handleStatusChange = async (id: string, newStatus: PostStatus) => {
    const originalPosts = [...posts];
    setPosts(prev => prev.filter(p => p.id !== id));
    
    const error = await db.updatePostStatus(id, newStatus);
    if (error) {
      setPosts(originalPosts);
      setModal({
        isOpen: true,
        title: 'Action Failed',
        message: 'Could not update post status in database.',
        type: 'error'
      });
    }
  };

  const handleDelete = (id: string) => {
    setModal({
      isOpen: true,
      title: 'Permanently Delete?',
      message: 'This post will be completely removed from the community feed and database. This cannot be undone.',
      type: 'confirm',
      showCancel: true,
      onConfirm: async () => {
        const originalPosts = [...posts];
        setPosts(prev => prev.filter(p => p.id !== id));
        
        const { error } = await db.deletePost(id);
        
        if (error) {
          setPosts(originalPosts);
          setModal({
            isOpen: true,
            title: 'Deletion Failed',
            message: 'An error occurred while deleting from database. Reverting UI.',
            type: 'error'
          });
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
        <div className="w-full max-w-sm bg-[#16161e] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-20 h-20 bg-purple-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
            <KeyRound className="w-10 h-10 text-purple-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Admin Portal</h1>
          <p className="text-gray-500 text-sm mb-8">Enter your security PIN to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-center text-white text-3xl tracking-[0.5em] focus:outline-none focus:border-purple-500 transition shadow-inner" autoFocus />
            {error && <p className="text-red-400 text-xs font-bold animate-pulse">{error}</p>}
            <button type="submit" className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition shadow-xl shadow-purple-900/20">Verify Access</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-10 animate-fade-in-up pb-24 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3"><LayoutList className="text-purple-400 w-8 h-8" />Moderation</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage Pioneer submissions</p>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 w-full md:w-auto">
          {(['pending', 'approved', 'rejected'] as PostStatus[]).map((status) => (
            <button key={status} onClick={() => setActiveTab(status)} className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all capitalize whitespace-nowrap tracking-widest ${activeTab === status ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>{status}</button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 px-2">
          <span>{posts.length} {activeTab} posts</span>
          <button onClick={handleRefresh} className="flex items-center gap-1.5 hover:text-purple-400 transition group"><RefreshCw size={12} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />Sync</button>
        </div>

        {loading && <div className="py-20 text-center"><Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4 opacity-50" /><p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Fetching Database...</p></div>}

        {!loading && posts.length === 0 && <div className="py-24 text-center bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed"><div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">{activeTab === 'pending' ? <CheckCircle className="text-gray-700" /> : <Clock className="text-gray-700" />}</div><p className="text-gray-600 font-bold uppercase tracking-widest text-sm">Clear Queue</p></div>}

        {!loading && posts.map(post => (
          <div key={post.id} className="group bg-[#1a1a20] border border-white/5 rounded-[2rem] p-6 hover:border-purple-500/30 transition-all duration-300 shadow-sm hover:shadow-2xl hover:bg-[#202026]">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-start gap-5 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border border-white/5 shadow-inner ${activeTab === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : activeTab === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{activeTab === 'pending' && <Clock size={24} />}{activeTab === 'approved' && <CheckCircle size={24} />}{activeTab === 'rejected' && <AlertTriangle size={24} />}</div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-white/5 text-gray-400 uppercase tracking-widest border border-white/5">{post.category}</span>
                    <span className="text-[10px] font-bold text-gray-600">by @{post.username}</span>
                  </div>
                  <h3 className="font-black text-white text-lg pr-4 break-words leading-tight">{post.title}</h3>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed break-words">{post.description}</p>
                  <a href={post.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-2 text-[10px] font-bold text-blue-500 mt-4 hover:text-blue-300 transition-colors break-all bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10"><ExternalLink size={12} className="shrink-0 mt-0.5" />{post.url}</a>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 w-full sm:w-auto sm:self-center border-t border-white/5 pt-5 sm:border-0 sm:pt-0 mt-2 sm:mt-0">
                {activeTab === 'pending' && <><button onClick={() => handleStatusChange(post.id, 'rejected')} className="flex-1 sm:flex-none h-12 px-5 rounded-2xl bg-white/5 hover:text-red-400 border border-white/5 transition flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"><X size={18} /><span className="sm:hidden">Reject</span></button><button onClick={() => handleStatusChange(post.id, 'approved')} className="flex-1 sm:flex-none h-12 px-5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white transition flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-900/20"><Check size={18} /><span className="sm:hidden">Approve</span></button></>}
                {activeTab === 'approved' && <><button onClick={() => handleStatusChange(post.id, 'rejected')} className="flex-1 sm:flex-none h-12 px-5 rounded-2xl bg-white/5 hover:text-yellow-400 border border-white/5 transition flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"><X size={18} /><span className="sm:hidden">Unpublish</span></button><button onClick={() => handleDelete(post.id)} className="flex-1 sm:flex-none h-12 w-12 rounded-2xl bg-white/5 hover:text-red-400 border border-white/5 transition flex items-center justify-center"><Trash2 size={18} /></button></>}
                {activeTab === 'rejected' && <><button onClick={() => handleStatusChange(post.id, 'pending')} className="flex-1 sm:flex-none h-12 px-5 rounded-2xl bg-white/5 hover:text-purple-400 border border-white/5 transition flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"><RefreshCw size={18} /><span className="sm:hidden">Restore</span></button><button onClick={() => handleDelete(post.id)} className="flex-1 sm:flex-none h-12 w-12 rounded-2xl bg-white/5 hover:text-red-400 border border-white/5 transition flex items-center justify-center"><Trash2 size={18} /></button></>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        showCancel={modal.showCancel}
      />
    </div>
  );
};

export default Admin;