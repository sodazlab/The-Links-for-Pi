import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './services/authContext';
import { LanguageProvider } from './services/languageContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Admin from './pages/Admin';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-[#0f0f12] text-white selection:bg-purple-500/30 flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/submit" element={<Submit />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
              </Routes>
            </main>
            
            <footer className="py-10 text-center border-t border-white/5 mt-auto bg-[#0f0f12]">
              <div className="max-w-7xl mx-auto px-6">
                <p className="text-gray-600 text-sm mb-4">© 2024 The Links. Unofficial Pi Network Community App.</p>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                  <Link 
                    to="/privacy" 
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-purple-400 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <span className="hidden md:block w-1 h-1 rounded-full bg-gray-800" />
                  <Link 
                    to="/terms" 
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-pink-400 transition-colors"
                  >
                    Terms of Service
                  </Link>
                  <span className="hidden md:block w-1 h-1 rounded-full bg-gray-800" />
                  <a 
                    href="mailto:sodazlabs@gmail.com"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;