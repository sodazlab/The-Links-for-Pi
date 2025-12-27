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

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'confirm' | 'error' | 'success' | 'warning';
    showCancel?: boolean;
    onConfirm?: () => Promise<void> | void;
    confirmText?: string;
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

  const handleStatusChange = async (id: string, newStatus: PostStatus) => {
    const targetId = String(id).trim();
    const originalPosts = [...posts];
    setPosts(prev => prev.filter(p => String(p.id).trim() !== targetId));
    
    const err = await db.updatePostStatus(id, newStatus);
    if (err) {
      setPosts(originalPosts);
      setModal({
        isOpen: true,
        title: 'Action Failed',
        message: 'Could not update status. Please check your DB permissions or network.',
        type: 'error'
      });
    }
  };

  const handleDelete = (id: string) => {
    const targetId = String(id).trim();
    setModal({
      isOpen: true,
      title: 'Delete Permanently?',
      message: 'This action cannot be undone and all data will be lost.',
      type: 'confirm',
      showCancel: true,
      confirmText: 'Delete Now',
      onConfirm: async () => {
        const originalPosts = [...posts];
        setPosts(prev => prev.filter(p => String(p.id).trim() !== targetId));
        
        const { error: dbError } = await db.deletePost(targetId);
        
        if (dbError) {
          setPosts(originalPosts);
          setModal({
            isOpen: true,
            title: 'Delete Failed',
            message: `Could not remove data from the database.`,
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
      setError('Please enter the correct PIN.');
      setPassword('');
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4 animate-fade-in-up">
        <div className="w-full max-sm bg-[#16161e] border border-white/10 rounded-[3rem] p-10 shadow-2xl text-center backdrop-blur-xl">
          <div className="w-20 h-20 bg-purple-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-purple-500/20">
            <KeyRound size={32} className="text-purple-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Admin Mode</h1>
          <p className="text-gray-500 text-xs mb-8 font-bold uppercase tracking-widest">Authorization Required</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••" 
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-center text-white text-3xl tracking-[0.5em] focus:outline-none focus:border-purple-500 transition shadow-inner" 
              autoFocus 
            />
            {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">{error}</p>}
            <button type="submit" className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition shadow-lg shadow-purple-900/20 uppercase text-[10px] tracking-widest">Verify Access</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-32 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-4">
            <LayoutList className="text-purple-400 w-8 h-8" /> Moderation
          </h1>
          <p className="text-gray-500 text-xs mt-2 font-black uppercase tracking-[0.2em]">Pioneer Content Control</p>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
          {(['pending', 'approved', 'rejected'] as PostStatus[]).map((status) => (
            <button 
              key={status} 
              onClick={() => setActiveTab(status)} 
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all capitalize tracking-widest ${activeTab === status ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
          <span>{posts.length} Items Found</span>
          <button onClick={loadPosts} className="flex items-center gap-2 hover:text-purple-400 transition">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sync Queue
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4 opacity-50" />
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Retrieving Submissions...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-32 text-center bg-white/[0.02] rounded-[3rem] border border-white/5 border-dashed">
            <CheckCircle size={40} className="text-gray-800 mx-auto mb-4" />
            <p className="text-gray-700 font-black uppercase tracking-[0.2em] text-xs">Queue is currently clear</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="group bg-[#1a1a20] border border-white/5 rounded-[2.5rem] p-6 lg:p-8 hover:border-purple-500/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:bg-[#1e1e24]">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex items-start gap-5 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border border-white/5 shadow-inner ${activeTab === 'pending' ? 'bg-yellow-500/5 text-yellow-500' : activeTab === 'approved' ? 'bg-green-500/5 text-green-500' : 'bg-red-500/5 text-red-500'}`}>
                    {activeTab === 'pending' && <Clock size={24} />}
                    {activeTab === 'approved' && <CheckCircle size={24} />}
                    {activeTab === 'rejected' && <AlertTriangle size={24} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-[9px] font-black px-3 py-1 rounded-lg bg-white/5 text-gray-400 uppercase tracking-widest border border-white/5">{post.category}</span>
                      <span className="text-[9px] font-bold text-gray-600 tracking-wide">@{post.username}</span>
                    </div>
                    <h3 className="font-black text-white text-lg leading-tight mb-2 break-words">{post.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 whitespace-pre-wrap break-words">{post.description}</p>
                    <a href={post.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[9px] font-black text-blue-500 hover:text-blue-400 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10 break-all">
                      <ExternalLink size={10} className="flex-shrink-0" /> <span>{post.url}</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 w-full lg:w-auto border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                  {activeTab === 'pending' && (
                    <>
                      <button onClick={() => handleStatusChange(post.id, 'rejected')} className="flex-1 lg:flex-none h-12 px-5 rounded-2xl bg-white/5 text-gray-400 hover:text-red-400 border border-white/5 transition flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"><X size={16} /><span className="lg:hidden">Reject</span></button>
                      <button onClick={() => handleStatusChange(post.id, 'approved')} className="flex-1 lg:flex-none h-12 px-5 rounded-2xl bg-purple-600 text-white hover:bg-purple-500 transition flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-900/20"><Check size={16} /><span className="lg:hidden">Approve</span></button>
                    </>
                  )}
                  {activeTab !== 'pending' && (
                    <>
                      <button onClick={() => handleStatusChange(post.id, 'pending')} className="flex-1 lg:flex-none h-12 px-5 rounded-2xl bg-white/5 text-gray-400 hover:text-purple-400 border border-white/5 transition flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"><RefreshCw size={16} /><span className="lg:hidden">Restore</span></button>
                      <button onClick={() => handleDelete(post.id)} className="h-12 w-12 rounded-2xl bg-white/5 text-gray-400 hover:text-red-400 border border-white/5 transition flex items-center justify-center"><Trash2 size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        showCancel={modal.showCancel}
        confirmText={modal.confirmText}
      />
    </div>
  );
};

export default Admin;