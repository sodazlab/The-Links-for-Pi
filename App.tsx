import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './services/authContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Admin from './pages/Admin';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#0f0f12] text-white selection:bg-purple-500/30 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          
          <footer className="py-8 text-center text-gray-600 text-sm border-t border-white/5 mt-auto bg-[#0f0f12]">
            <p>© 2024 The Links. Unofficial Pi Network Community App.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;