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
      window.location.reload();
    } else {
      navigate('/');
    }
  };

  const handleAdminLogin = () => {
    navigate('/admin');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f0f12]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <button onClick={handleNavHome} className="flex items-center gap-2 group p-1 -ml-1 rounded-xl active:bg-white/5 transition-colors">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform shadow-lg shadow-purple-900/20">
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
            className={`text-sm font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-colors ${location.pathname === '/' ? 'text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            Discover
          </button>
          {user?.role === 'admin' && (
            <Link 
              to="/admin" 
              className={`text-sm font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-colors ${location.pathname === '/admin' ? 'text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              Moderation
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!user ? (
             <div className="flex items-center gap-2">
               <button 
                onClick={() => loginAsPioneer()}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-lg shadow-purple-900/20 active:scale-95"
               >
                 Connect Wallet
               </button>
               <button 
                onClick={handleAdminLogin}
                className="p-3 text-gray-500 hover:text-white transition active:bg-white/5 rounded-full"
                title="Admin Access"
                aria-label="Admin Access"
               >
                 <Shield size={18} />
               </button>
             </div>
          ) : (
            <div className="flex items-center gap-1 md:gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mr-1">
                <img src={user.avatarUrl} alt="User" className="w-6 h-6 rounded-full" />
                <span className="text-xs font-medium text-gray-300 truncate max-w-[100px]">{user.username}</span>
                {user.role === 'admin' && <Shield size={12} className="text-purple-400" />}
              </div>
              
              {/* Mobile Avatar (Icon only) */}
              <div className="md:hidden w-8 h-8 rounded-full overflow-hidden border border-white/10 mr-1">
                <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" />
              </div>
              
              <Link 
                to="/submit" 
                title="Submit Link" 
                className="p-2.5 text-purple-400 hover:text-purple-300 active:text-white active:bg-purple-600/20 rounded-full transition-all"
              >
                <PlusCircle size={22} />
              </Link>
              
              <button 
                onClick={logout} 
                className="p-2.5 text-gray-500 hover:text-red-400 active:text-red-500 active:bg-red-500/10 rounded-full transition-all" 
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;