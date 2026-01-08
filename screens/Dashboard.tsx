
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
  const [adTimer, setAdTimer] = useState<number | null>(null);

  // Load Native Ad on mount
  useEffect(() => {
    const win = window as any;
    if (win.AppInventor) {
      win.AppInventor.setWebViewString("load_native_ad");
    }
  }, []);

  const handleStartAd = () => {
    setIsWatching(true);
    setStatusMessage("Preparing your ad...");
    
    // 2-Second Prep Timer
    let timeLeft = 2;
    setAdTimer(timeLeft);
    
    const countdown = setInterval(() => {
      timeLeft -= 1;
      setAdTimer(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(countdown);
        setAdTimer(null);
        triggerNativeAd();
      }
    }, 1000);
  };

  const triggerNativeAd = () => {
    const win = window as any;
    if (win.AppInventor) {
      console.log("Triggering Native Ad via WebViewString");
      win.AppInventor.setWebViewString("show_rewarded_ad");
    } else {
      // Browser Mock
      console.log("Native bridge not found. Mocking ad reward...");
      setTimeout(() => {
        window.postMessage("reward_granted", "*");
      }, 3000);
    }
  };

  useEffect(() => {
    const handleNativeMessage = (event: MessageEvent) => {
      if (event.data === "reward_granted") {
        setIsWatching(false);
        setStatusMessage("✅ Points Added!");
        setTimeout(() => setStatusMessage(null), 3000);
      } 
      else if (event.data === "ad_not_ready") {
        setIsWatching(false);
        setStatusMessage("⏳ Ad not ready. Try in a moment.");
        setTimeout(() => setStatusMessage(null), 4000);
      }
      else if (event.data === "ad_dismissed" || event.data === "ad_failed") {
        setIsWatching(false);
        setStatusMessage(null);
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
      <div className="flex items-center justify-between mb-8 mt-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#13ec5b] p-1 shadow-lg">
            <img src={user.photoUrl} alt="User" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Hi, {user.name.split(' ')[0]}</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Active Member</p>
          </div>
        </div>
        <button onClick={() => navigate('/settings')} className="p-3 glass rounded-2xl active:scale-90 transition-transform">
          <ICONS.Settings className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Balance Display */}
      <div className="glass rounded-[32px] p-8 mb-6 text-center border border-white/10 shadow-2xl relative overflow-hidden">
        <p className="text-gray-500 font-bold text-[9px] mb-2 uppercase tracking-[0.2em]">Balance</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-5xl font-black text-[#13ec5b] tracking-tighter">
            {user.points.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-[#13ec5b] opacity-60">PTS</span>
        </div>

        <div className="mt-8">
          <button 
            onClick={handleStartAd}
            disabled={isWatching}
            className={`w-full h-16 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-xl ${isWatching ? 'bg-gray-800' : 'bg-[#13ec5b]'}`}
          >
            {isWatching ? (
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest animate-pulse">
                  {adTimer !== null ? `Loading in ${adTimer}s...` : 'Ad is Playing'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ICONS.Play className="w-5 h-5 text-[#102216]" />
                <span className="font-black text-[#102216] uppercase tracking-wider">Watch Ad</span>
              </div>
            )}
          </button>
          
          {statusMessage && (
            <p className={`mt-3 text-[10px] font-black uppercase tracking-widest ${statusMessage.includes('✅') ? 'text-[#13ec5b]' : 'text-yellow-500'}`}>
              {statusMessage}
            </p>
          )}
        </div>
      </div>

      {/* Native Ad Placeholder - This tells you where to put the Native Ad component in Android Builder */}
      <div className="mb-6 p-4 glass rounded-[24px] border border-dashed border-white/10 flex flex-col items-center justify-center min-h-[100px]">
        <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">Sponsored Content</span>
        <div id="native-ad-container" className="w-full text-center text-[10px] text-gray-500 italic">
          (Native Ad will appear here)
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/withdraw')} className="glass p-5 rounded-[28px] flex flex-col gap-3 active:scale-95 transition-all">
          <ICONS.Wallet className="w-5 h-5 text-[#13ec5b]" />
          <span className="font-bold text-sm">Redeem</span>
        </button>
        <button onClick={() => navigate('/history')} className="glass p-5 rounded-[28px] flex flex-col gap-3 active:scale-95 transition-all">
          <ICONS.History className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm">History</span>
        </button>
      </div>

      {user.isAdmin && (
        <button onClick={() => navigate('/admin')} className="mt-8 py-3 glass border-dashed border-[#13ec5b]/20 rounded-xl text-[#13ec5b] font-black uppercase tracking-widest text-[9px]">
          Admin Controls
        </button>
      )}

      <ConfirmationDialog 
        isOpen={showLogoutConfirm}
        title="Log Out?"
        message="End session?"
        confirmText="Log Out"
        isDanger={true}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default Dashboard;
