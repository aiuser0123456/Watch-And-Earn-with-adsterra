
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import Layout from '../components/Layout';
import { mockDb } from '../services/mockData';
import ConfirmationDialog from '../components/ConfirmationDialog';

const Settings: React.FC = () => {
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    mockDb.setCurrentUser(null);
    setUser(null); // This triggers the redirect automatically via App.tsx routing
  };

  if (!user) return null;

  return (
    <Layout title="Settings" backTo="/">
      <div className="flex flex-col items-center mt-4 mb-10">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-[#13ec5b] p-1 mb-4 shadow-[0_0_20px_rgba(19,236,91,0.2)]">
            <img src={user.photoUrl} className="w-full h-full rounded-full object-cover" alt="Profile" />
          </div>
          <div className="absolute bottom-6 right-1 w-5 h-5 bg-[#13ec5b] border-4 border-[#102216] rounded-full" />
        </div>
        <h2 className="text-2xl font-black mb-1">{user.name}</h2>
        <div className="bg-[#13ec5b]/10 text-[#13ec5b] px-4 py-1 rounded-full text-sm font-bold flex items-center gap-2">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
           {user.points.toLocaleString()} Pts
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-gray-500 text-xs font-black uppercase mb-4 tracking-widest flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
             Account Details
          </h3>
          <div className="space-y-4">
            <div className="glass p-5 rounded-[24px] border border-white/5">
              <p className="text-gray-500 text-xs font-bold uppercase mb-1">Full Name</p>
              <p className="font-bold text-lg">{user.name}</p>
            </div>
            <div className="glass p-5 rounded-[24px] border border-white/5">
              <p className="text-gray-500 text-xs font-bold uppercase mb-1">Email Address</p>
              <p className="font-bold text-lg">{user.email}</p>
            </div>
          </div>
        </div>

        <div>
           <h3 className="text-gray-500 text-xs font-black uppercase mb-4 tracking-widest flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
             Legal
          </h3>
          <div className="space-y-3">
             <button 
               onClick={() => navigate('/terms')}
               className="w-full glass p-5 rounded-[24px] border border-white/5 flex items-center justify-between group"
             >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-500/10 rounded-lg group-hover:bg-gray-500/20 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <span className="font-bold">Terms and Conditions</span>
                </div>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
             </button>
             <button 
               onClick={() => navigate('/privacy')}
               className="w-full glass p-5 rounded-[24px] border border-white/5 flex items-center justify-between group"
             >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-500/10 rounded-lg group-hover:bg-gray-500/20 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <span className="font-bold">Privacy Policy</span>
                </div>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
             </button>
          </div>
        </div>

        <div className="pt-6">
           <button 
             onClick={() => setShowLogoutConfirm(true)}
             className="w-full h-16 glass border-red-500/20 text-red-400 rounded-3xl font-black text-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
           >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Log Out
           </button>
           <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-6">App Version 2.4.0 (156)</p>
        </div>
      </div>

      <ConfirmationDialog 
        isOpen={showLogoutConfirm}
        title="Log Out?"
        message="Are you sure you want to end your current session?"
        confirmText="Log Out"
        isDanger={true}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </Layout>
  );
};

export default Settings;
