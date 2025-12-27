import React from 'react';
import { useAuth } from '../services/authContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, LogOut, Shield, User as UserIcon } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, loginAsPioneer, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavHome = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      // 이미 홈이면 새로고침 수행
      window.location.reload();
    } else {
      // 홈이 아니면 홈으로 이동
      navigate('/');
    }
  };

  const handleAdminLogin = () => {
    navigate('/admin');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f0f12]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <button onClick={handleNavHome} className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
            L
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden md:block group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
            The Links
          </span>
        </button>

        {/* Middle Nav */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handleNavHome} 
            className={`text-sm font-black uppercase tracking-widest hover:text-white transition ${location.pathname === '/' ? 'text-white border-b-2 border-purple-500 pb-1' : 'text-gray-500'}`}
          >
            Discover
          </button>
          {user?.role === 'admin' && (
            <Link to="/admin" className={`text-sm font-black uppercase tracking-widest hover:text-white transition ${location.pathname === '/admin' ? 'text-white border-b-2 border-purple-500 pb-1' : 'text-gray-500'}`}>
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!user ? (
             <div className="flex gap-2">
               <button 
                onClick={() => loginAsPioneer()}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-lg shadow-purple-900/20"
               >
                 Connect Wallet
               </button>
               <button 
                onClick={handleAdminLogin}
                className="p-2 text-gray-500 hover:text-white transition"
                title="Admin Login"
               >
                 <Shield size={16} />
               </button>
             </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <img src={user.avatarUrl} alt="User" className="w-6 h-6 rounded-full" />
                <span className="text-xs font-medium text-gray-300 truncate max-w-[100px]">{user.username}</span>
              </div>
              
              <Link to="/submit" title="Submit Link" className="hover:scale-110 transition-transform">
                <PlusCircle className="text-purple-400 hover:text-purple-300 transition cursor-pointer" />
              </Link>
              
              <button onClick={logout} className="text-gray-500 hover:text-red-400 transition" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;