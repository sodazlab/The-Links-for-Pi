import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { db } from '../services/db';
import { Post } from '../types';
import { Check, X, Clock, KeyRound, Loader2 } from 'lucide-react';

const Admin: React.FC = () => {
  const { user, loginAsAdmin } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch pending posts only after verification
  useEffect(() => {
    if (isVerified && user?.role === 'admin') {
      loadPendingPosts();
    }
  }, [isVerified, user]);

  const loadPendingPosts = async () => {
    setLoading(true);
    const data = await db.getPendingPosts();
    setPosts(data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    // Optimistic update
    setPosts(prev => prev.filter(p => p.id !== id));
    const error = await db.updatePostStatus(id, 'approved');
    if (error) {
      alert('Failed to approve');
      loadPendingPosts(); // Revert/Reload on error
    }
  };

  const handleReject = async (id: string) => {
    // Optimistic update
    setPosts(prev => prev.filter(p => p.id !== id));
    const error = await db.updatePostStatus(id, 'rejected');
    if (error) {
      alert('Failed to reject');
      loadPendingPosts(); // Revert/Reload on error
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

  // 3. Render Dashboard
  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Moderation Queue</h1>
        <div className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium border border-purple-500/30">
          Pending: {posts.length}
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
           <div className="p-12 text-center">
             <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
           </div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">All caught up! No pending posts.</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-[#1e1e24] border border-white/10 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <Clock className="text-gray-400 w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{post.title}</h3>
                  <a href={post.url} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline block mb-1">
                    {post.url}
                  </a>
                  <p className="text-gray-400 text-sm">{post.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400 uppercase">{post.category}</span>
                    <span className="text-xs text-gray-500 py-0.5">by {post.username}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => handleReject(post.id)}
                  className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition flex items-center justify-center gap-2"
                >
                  <X size={18} /> Reject
                </button>
                <button 
                  onClick={() => handleApprove(post.id)}
                  className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 transition flex items-center justify-center gap-2"
                >
                  <Check size={18} /> Approve
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Admin;