import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 animate-fade-in-up">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-black uppercase tracking-widest">Go Back</span>
      </button>

      <div className="bg-[#16161e] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
              <ShieldCheck className="text-purple-400 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white leading-tight">Privacy Policy</h1>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">For The Links App</p>
            </div>
          </div>

          <div className="space-y-10 text-gray-400 text-sm leading-relaxed font-medium">
            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                1. Introduction
              </h2>
              <p>
                Welcome to The Links. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application within the Pi Network ecosystem.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                2. Information We Collect
              </h2>
              <p className="mb-4">
                We believe in minimizing data collection. To provide our services, we collect only the following information:
              </p>
              <ul className="space-y-3 pl-4">
                <li className="flex gap-3">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong className="text-gray-200">Pi Network Username:</strong> We collect your unique Pi Username through the Pi Network SDK to authenticate your account and manage your interactions within the app (such as link submissions).</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-400 font-bold">•</span>
                  <span><strong className="text-gray-200">No Other Personal Data:</strong> We do not collect your real name, phone number, email address, location data, or device ID.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                3. How We Use Your Information
              </h2>
              <p className="mb-3">We use your Pi Username solely for the following purposes:</p>
              <ul className="space-y-2 pl-4 list-disc list-inside">
                <li>To identify you as a unique user within the app.</li>
                <li>To manage and attribute the links you submit to the platform.</li>
                <li>To prevent spam and ensure the quality of shared information.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                4. Data Sharing and Disclosure
              </h2>
              <p>
                We do not sell, trade, or otherwise transfer your Pi Username to outside parties. We do not track your browsing history outside of our application.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                5. Security
              </h2>
              <p>
                We implement reasonable security measures to maintain the safety of your information. However, please remember that no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                6. Changes to This Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
              </p>
            </section>

            <section className="pt-8 border-t border-white/5">
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                <Mail size={14} className="text-purple-400" />
                7. Contact Us
              </h2>
              <p className="mb-4">If you have any questions about this Privacy Policy, please contact us at:</p>
              <a 
                href="mailto:sodazlabs@gmail.com" 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
              >
                sodazlabs@gmail.com
              </a>
            </section>
          </div>
        </div>
      </div>
      
      <p className="text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-12">
        Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
};

export default Privacy;