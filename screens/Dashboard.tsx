
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
  const [timerCount, setTimerCount] = useState<number>(0);

  // Initial setup for Native Ads
  useEffect(() => {
    const win = window as any;
    if (win.AppInventor) {
      win.AppInventor.setWebViewString("load_native_ad");
    }
  }, []);

  const handleStartAd = () => {
    setIsWatching(true);
    setStatusMessage("Wait 2-3 sec, your ad is loading...");
    
    // UI Timer logic for exactly what you asked
    setTimerCount(3);
    const interval = setInterval(() => {
      setTimerCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerNativeRewardedAd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerNativeRewardedAd = () => {
    const win = window as any;
    if (win.AppInventor) {
      win.AppInventor.setWebViewString("show_rewarded_ad");
    } else {
      // Browser Mock behavior
      console.log("Native Ad Triggered");
      setTimeout(() => {
        window.postMessage("reward_granted", "*");
      }, 2000);
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
        setStatusMessage("⏳ Ad not ready. Try again in 5s.");
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
    <div className="flex-1 flex flex-col p-6 pb-24 relative overflow-y-auto no-scrollbar bg-[#102216]">
      <div className="flex items-center justify-between mb-8 mt-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#13ec5b] p-1 shadow-lg overflow-hidden bg-white/5">
            <img src={user.photoUrl} alt="User" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Hi, {user.name.split(' ')[0]}</h2>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Verified User</p>
          </div>
        </div>
        <button onClick={() => navigate('/settings')} className="p-3 glass rounded-2xl active:scale-90 transition-transform">
          <ICONS.Settings className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      <div className="glass rounded-[32px] p-8 mb-6 text-center border border-white/10 shadow-2xl relative overflow-hidden">
        <p className="text-gray-500 font-bold text-[9px] mb-2 uppercase tracking-[0.2em]">Current Balance</p>
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
                  {timerCount > 0 ? `Loading Ad in ${timerCount}s...` : 'Ad Playing...'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ICONS.Play className="w-5 h-5 text-[#102216]" />
                <span className="font-black text-[#102216] uppercase tracking-wider">Watch & Earn</span>
              </div>
            )}
          </button>
          
          {statusMessage && (
            <p className={`mt-3 text-[10px] font-black uppercase tracking-widest text-center ${statusMessage.includes('✅') ? 'text-[#13ec5b]' : 'text-yellow-500'}`}>
              {statusMessage}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 p-4 glass rounded-[24px] border border-dashed border-white/10 min-h-[110px] flex flex-col items-center justify-center">
        <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em] mb-2">Native Sponsored</span>
        <div className="text-[10px] text-gray-500 italic">
          (AdMob Native Ad Container)
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => navigate('/withdraw')} className="glass p-5 rounded-[28px] flex flex-col gap-3 active:scale-95 transition-all">
          <ICONS.Wallet className="w-5 h-5 text-[#13ec5b]" />
          <span className="font-bold text-sm">Withdraw</span>
        </button>
        <button onClick={() => navigate('/history')} className="glass p-5 rounded-[28px] flex flex-col gap-3 active:scale-95 transition-all">
          <ICONS.History className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm">History</span>
        </button>
      </div>

      <ConfirmationDialog 
        isOpen={showLogoutConfirm}
        title="Log Out?"
        message="End your earning session?"
        confirmText="Log Out"
        isDanger={true}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default Dashboard;
