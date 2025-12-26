import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { Post, PostStatus } from '../types';
import { Check, X, Clock, KeyRound, Loader2, Trash2, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

const Admin: React.FC = () => {
  const { user, loginAsAdmin } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<PostStatus>('pending');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // Load posts whenever verification or active tab changes
  useEffect(() => {
    if (isVerified && user?.role === 'admin') {
      loadPosts();
    }
  }, [isVerified, user, activeTab]);

  const loadPosts = async () => {
    setLoading(true);
    const data = await db.getPostsByStatus(activeTab);
    setPosts(data);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: PostStatus) => {
    // Optimistic update: Remove immediately from current view
    setPosts(prev => prev.filter(p => p.id !== id));
    
    const error = await db.updatePostStatus(id, newStatus);
    if (error) {
      alert(`Failed to update status to ${newStatus}`);
      loadPosts(); // Revert/Reload on error
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this post?")) return;

    // Optimistic update: Remove immediately from UI
    setPosts(prev => prev.filter(p => p.id !== id));
    
    const { error } = await db.deletePost(id);
    if (error) {
      console.error("Delete failed", error);
      alert("Failed to delete post from database.");
      loadPosts(); // Revert UI if failed
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'pnc123') {
      loginAsAdmin(); // Ensures user role is Admin
      setIsVerified(true);
      setError('');
    } else {
      setError('Invalid password. Access denied.');
      setPassword('');
    }
  };

  // Unified Guard: If not admin OR not verified (even if role is admin), show login/verify screen
  if (!user || user.role !== 'admin' || !isVerified) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4 animate-fade-in-up">
        <div className="w-full max-w-md bg-[#16161e] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
              <KeyRound className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-gray-400 mt-2 text-sm">Enter PIN to verify privileges.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter PIN code"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-center text-white text-lg tracking-widest focus:outline-none focus:border-purple-500 transition placeholder:text-gray-600"
                autoFocus
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-xs text-center font-medium animate-pulse">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition shadow-lg shadow-purple-900/20"
            >
              Verify Access
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
               Development PIN: <span className="font-mono text-gray-500">pnc123</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render Dashboard with Tabs
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white">Content Admin</h1>
        
        {/* Status Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full md:w-auto overflow-x-auto">
          {(['pending', 'approved', 'rejected'] as PostStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
                activeTab === status 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {loading ? (
           <div className="p-12 text-center">
             <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
           </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'pending' && <CheckCircle className="text-green-500" />}
                {activeTab === 'approved' && <Clock className="text-gray-500" />}
                {activeTab === 'rejected' && <CheckCircle className="text-gray-500" />}
            </div>
            <p className="text-gray-300 text-lg capitalize">No {activeTab} posts found.</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-[#1e1e24] border border-white/10 p-3 rounded-xl flex items-center justify-between gap-3 group hover:border-white/20 transition">
              
              {/* Left Side: Icon & Content */}
              <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center ${
                    activeTab === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    activeTab === 'approved' ? 'bg-green-500/10 text-green-500' :
                    'bg-red-500/10 text-red-500'
                }`}>
                  {activeTab === 'pending' && <Clock className="w-5 h-5" />}
                  {activeTab === 'approved' && <CheckCircle className="w-5 h-5" />}
                  {activeTab === 'rejected' && <AlertTriangle className="w-5 h-5" />}
                </div>
                
                <div className="min-w-0 flex flex-col justify-center">
                  <h3 className="font-bold text-white text-sm md:text-base truncate leading-tight mb-0.5">{post.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="uppercase bg-white/5 px-1.5 rounded border border-white/5">{post.category}</span>
                    <span className="truncate max-w-[100px] md:max-w-[200px]">{post.description}</span>
                  </div>
                  <a href={post.url} target="_blank" rel="noreferrer" className="text-blue-400 text-xs hover:underline truncate block mt-0.5 flex items-center gap-1 opacity-70 hover:opacity-100">
                    <ExternalLink size={10} /> {post.url}
                  </a>
                </div>
              </div>

              {/* Right Side: Actions (Compact Buttons) */}
              <div className="flex items-center gap-2 shrink-0">
                {activeTab === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleStatusChange(post.id, 'rejected')}
                      className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition flex items-center justify-center"
                      title="Reject"
                    >
                      <X size={18} />
                    </button>
                    <button 
                      onClick={() => handleStatusChange(post.id, 'approved')}
                      className="w-9 h-9 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 transition flex items-center justify-center"
                      title="Approve"
                    >
                      <Check size={18} />
                    </button>
                  </>
                )}

                {activeTab === 'approved' && (
                  <>
                     <button 
                      onClick={() => handleStatusChange(post.id, 'rejected')}
                      className="w-9 h-9 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 transition flex items-center justify-center"
                      title="Unpublish (Reject)"
                    >
                      <X size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="w-9 h-9 rounded-lg bg-gray-700 hover:bg-red-900/30 text-gray-400 hover:text-red-400 border border-transparent hover:border-red-500/30 transition flex items-center justify-center"
                      title="Permanently Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}

                {activeTab === 'rejected' && (
                  <>
                     <button 
                      onClick={() => handleStatusChange(post.id, 'approved')}
                      className="w-9 h-9 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 transition flex items-center justify-center"
                      title="Restore (Approve)"
                    >
                      <Check size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="w-9 h-9 rounded-lg bg-gray-700 hover:bg-red-900/30 text-gray-400 hover:text-red-400 border border-transparent hover:border-red-500/30 transition flex items-center justify-center"
                      title="Permanently Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Admin;