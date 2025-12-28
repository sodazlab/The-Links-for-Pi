import React from 'react';
import { motion } from 'framer-motion';
import { Gavel, Mail, ArrowLeft, ShieldAlert, ExternalLink, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms: React.FC = () => {
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
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-600/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-pink-500/10 rounded-2xl border border-pink-500/20">
              <Gavel className="text-pink-400 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white leading-tight">Terms of Service</h1>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">For The Links App</p>
            </div>
          </div>

          <div className="space-y-10 text-gray-400 text-sm leading-relaxed font-medium">
            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using The Links (the "App"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the App.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                2. Description of Service
              </h2>
              <p>
                The Links is a community-driven hub for verified Pi Network links. Users can view curated links and submit new links for the community.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                3. User Conduct & Submissions
              </h2>
              <p className="mb-4">
                You are responsible for the content you submit. By submitting a link, you agree that:
              </p>
              <ul className="space-y-4 pl-4">
                <li className="flex gap-3">
                  <span className="text-pink-400 font-bold">01.</span>
                  <span><strong className="text-gray-200">Accuracy:</strong> The link provides accurate and useful information for Pi Pioneers.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-pink-400 font-bold">02.</span>
                  <span><strong className="text-gray-200">Safety:</strong> You will NOT submit links to phishing sites, malware, scams, or illegal content.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-pink-400 font-bold">03.</span>
                  <span><strong className="text-gray-200">Respect:</strong> You will not submit content that is offensive, hateful, or violates the rights of others.</span>
                </li>
              </ul>
              <div className="mt-6 p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs italic text-gray-500">
                  We reserve the right to review, reject, or remove any user-submitted links at our sole discretion without notice.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                4. Disclaimer of Warranties
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <ExternalLink size={16} className="text-pink-400 flex-shrink-0 mt-1" />
                  <p>
                    <strong className="text-gray-200">Third-Party Content:</strong> This App contains links to third-party websites or services that are not owned or controlled by The Links. We verify links to the best of our ability, but we assume no responsibility for the content, privacy policies, or practices of any third-party sites. You access them at your own risk.
                  </p>
                </div>
                <p>
                  <strong className="text-gray-200">"As Is" Basis:</strong> The App is provided on an "AS IS" and "AS AVAILABLE" basis.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                5. Relationship with Pi Network
              </h2>
              <div className="flex gap-3 p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                <Users size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-purple-200/60">
                  The Links is a third-party application developed by community members. It is not affiliated with, endorsed by, or an official product of the Pi Core Team or Pi Network.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                6. Limitation of Liability
              </h2>
              <p>
                In no event shall The Links or its developers be liable for any indirect, incidental, or consequential damages arising out of your use of the App or the links provided therein.
              </p>
            </section>

            <section>
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                7. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. Your continued use of the App following any changes indicates your acceptance of the new Terms.
              </p>
            </section>

            <section className="pt-8 border-t border-white/5">
              <h2 className="text-white font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                <Mail size={14} className="text-pink-400" />
                8. Contact Information
              </h2>
              <p className="mb-4">For any questions regarding these Terms, please contact us at:</p>
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

export default Terms;