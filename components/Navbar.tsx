import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { useLanguage } from '../services/languageContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PlusCircle, LogOut, Shield, Globe, ChevronDown } from 'lucide-react';
import { LANGUAGES, LanguageCode } from '../services/translations';

const Navbar: React.FC = () => {
  const { user, loginAsPioneer, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform shadow-lg shadow-purple-900/20">
            TL
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden md:block group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
            The Links
          </span>
        </button>

        {/* Middle Nav */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
            >
              <Globe size={14} />
              <span className="text-xs font-black uppercase tracking-wider">{LANGUAGES.find(l => l.code === language)?.label}</span>
              <ChevronDown size={10} className={`transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {langMenuOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-32 bg-[#16161e] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setLangMenuOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-white/5 transition-colors ${language === lang.code ? 'text-purple-400 bg-purple-500/10' : 'text-gray-400'}`}
                  >
                    {lang.label} <span className="text-[9px] font-normal text-gray-600 ml-1 uppercase">{lang.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user?.role === 'admin' && (
            <Link 
              to="/admin" 
              className={`text-sm font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-colors ${location.pathname === '/admin' ? 'text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              {t('nav.admin')}
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
                 {t('nav.connect')}
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
              <div className="flex items-center gap-2 px-1 md:px-3 py-1.5 rounded-full md:bg-white/5 md:border border-white/10 mr-1">
                <img src={user.avatarUrl} alt="User" className="w-6 h-6 rounded-full border border-white/10" />
                <span className="text-xs font-medium text-gray-300 truncate max-w-[70px] md:max-w-[100px]">{user.username}</span>
                {user.role === 'admin' && <Shield size={12} className="text-purple-400 flex-shrink-0" />}
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