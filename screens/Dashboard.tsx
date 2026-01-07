
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { ICONS } from '../constants';
import { logoutUser } from '../services/mockData';
import ConfirmationDialog from '../components/ConfirmationDialog';

const Dashboard: React.FC = () => {
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  
  const [isWatching, setIsWatching] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleStartAd = () => {
    setIsWatching(true);
    setStatusMessage(null);
    
    // Check for AndroidBuilder environment
    const win = window as any;
    if (win.AppInventor) {
      // This sends the signal to your Blocks
      win.AppInventor.setWebViewString("show_rewarded_ad");
    } else {
      // Browser testing mock
      console.log("Native bridge not found. Simulating ad...");
      setTimeout(() => {
        window.postMessage("reward_granted", "*");
      }, 3000);
    }
  };

  useEffect(() => {
    const handleNativeMessage = (event: MessageEvent) => {
      // These strings must match your "RunJavaScript" blocks in AndroidBuilder
      if (event.data === "reward_granted") {
        setIsWatching(false);
        setStatusMessage("✅ Points Added Successfully!");
        setTimeout(() => setStatusMessage(null), 3000);
      } else if (event.data === "ad_closed") {
        setIsWatching(false);
      } else if (event.data === "ad_not_ready") {
        setIsWatching(false);
        setStatusMessage("⏳ Ad is still loading... wait 5 seconds.");
        setTimeout(() => setStatusMessage(null), 4000);
      }
    };

    window.addEventListener('message', handleNativeMessage);
    return () => window.removeEventListener('message', handleNativeMessage);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate('/login', { replace: true });
    } catch (e) {
      setUser(null);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 relative overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 mt-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-2 border-[#13ec5b] p-1 shadow-[0_0_15px_rgba(19,236,91,0.3)]">
            <img src={user.photoUrl} alt="User" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Hi, {user.name.split(' ')[0]}</h2>
            <p className="text-gray-500 text-sm font-medium">{user.email}</p>
          </div>
        </div>
        <button onClick={() => navigate('/settings')} className="p-3 glass rounded-2xl active:scale-90 transition-transform">
          <ICONS.Settings className="w-6 h-6 text-gray-300" />
        </button>
      </div>

      {/* Balance Display */}
      <div className="glass rounded-[40px] p-8 mb-8 text-center relative overflow-hidden border border-white/10 shadow-2xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#13ec5b] opacity-10 rounded-full blur-[60px]" />
        <p className="text-gray-400 font-bold tracking-[0.2em] text-[10px] mb-2 uppercase opacity-60">Total Earnings</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-6xl font-black text-[#13ec5b] tracking-tighter drop-shadow-[0_0_20px_rgba(19,236,91,0.4)]">
            {user.points.toLocaleString()}
          </span>
          <span className="text-xl font-bold text-[#13ec5b] self-end mb-2">PTS</span>
        </div>

        <div className="mt-8">
          <button 
            onClick={handleStartAd}
            disabled={isWatching}
            className={`w-full h-16 rounded-[22px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${isWatching ? 'bg-gray-800' : 'bg-[#13ec5b] hover:brightness-110'}`}
          >
            {isWatching ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="font-bold text-white uppercase tracking-widest text-xs">Processing Ad...</span>
              </div>
            ) : (
              <>
                <ICONS.Play className="w-6 h-6 text-[#102216]" />
                <span className="font-bold text-[#102216] text-lg uppercase tracking-wider">Watch & Earn</span>
              </>
            )}
          </button>
          
          {statusMessage && (
            <div className="mt-4 animate-bounce">
              <p className={`text-[11px] font-black uppercase tracking-widest ${statusMessage.includes('✅') ? 'text-[#13ec5b]' : 'text-yellow-400'}`}>
                {statusMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/withdraw')} className="glass p-6 rounded-[32px] flex flex-col items-start gap-4 active:scale-95 transition-transform hover:bg-white/5 border border-white/5">
          <div className="w-12 h-12 bg-[#13ec5b]/10 rounded-2xl flex items-center justify-center text-[#13ec5b]">
            <ICONS.Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-bold text-lg">Redeem</span>
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Payouts</span>
          </div>
        </button>
        
        <button onClick={() => navigate('/history')} className="glass p-6 rounded-[32px] flex flex-col items-start gap-4 active:scale-95 transition-transform hover:bg-white/5 border border-white/5">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
            <ICONS.History className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-bold text-lg">History</span>
            <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Logs</span>
          </div>
        </button>
      </div>

      {user.isAdmin && (
        <button onClick={() => navigate('/admin')} className="mt-10 py-4 glass border-dashed border-[#13ec5b]/30 rounded-2xl text-[#13ec5b] font-black uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all">
          Owner Control Panel
        </button>
      )}

      <ConfirmationDialog 
        isOpen={showLogoutConfirm}
        title="Log Out?"
        message="Are you sure you want to end your current session?"
        confirmText="Log Out"
        isDanger={true}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default Dashboard;
