
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { ICONS } from '../constants';
import { logoutUser } from '../services/mockData';
import ConfirmationDialog from '../components/ConfirmationDialog';

const Dashboard: React.FC = () => {
  const { user, setUser, grantReward } = useApp();
  const navigate = useNavigate();
  
  const [isWatching, setIsWatching] = useState(false);
  const [timer, setTimer] = useState(0);
  const [rewardInfo, setRewardInfo] = useState<{points: number, isLucky: boolean} | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const AD_DURATION = 15;

  useEffect(() => {
    let interval: any;
    if (isWatching && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    } else if (isWatching && timer === 0) {
      completeAd();
    }
    return () => clearInterval(interval);
  }, [isWatching, timer]);

  const handleStartAd = () => {
    setIsWatching(true);
    setTimer(AD_DURATION);
    setRewardInfo(null);
  };

  const completeAd = async () => {
    setIsWatching(false);
    const result = await grantReward();
    setRewardInfo(result);
    setTimeout(() => setRewardInfo(null), 3000);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate('/login', { replace: true });
    } catch (e) {
      console.error(e);
      // Hard fallback
      setUser(null);
      window.location.href = '/#/login';
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 relative overflow-y-auto no-scrollbar">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-10 mt-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-2 border-[#13ec5b] p-1 shadow-[0_0_10px_rgba(19,236,91,0.2)]">
            <img src={user.photoUrl} alt="User" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Hi, {user.name.split(' ')[0]}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/settings')}
          className="p-3 glass rounded-2xl hover:bg-white/10 transition-colors"
        >
          <ICONS.Settings className="w-6 h-6 text-gray-300" />
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="glass rounded-[32px] p-8 mb-8 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#13ec5b] opacity-10 rounded-full blur-[60px] translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform" />
        <p className="text-gray-400 font-semibold tracking-widest text-sm mb-2 uppercase">Current Balance</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-6xl font-black text-[#13ec5b] tracking-tight drop-shadow-[0_0_15px_rgba(19,236,91,0.4)]">
            {user.points.toLocaleString()}
          </span>
          <span className="text-2xl font-bold text-[#13ec5b] self-end mb-2">PTS</span>
        </div>

        <button 
          onClick={handleStartAd}
          disabled={isWatching}
          className={`mt-10 w-full h-16 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 relative overflow-hidden group ${isWatching ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#13ec5b] shadow-[0_10px_30px_rgba(19,236,91,0.3)]'}`}
        >
          {isWatching ? (
            <div className="flex items-center gap-3">
              <span className="font-black text-white text-xl">{timer}s</span>
              <span className="font-bold text-white uppercase tracking-wider text-sm">Watching...</span>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <ICONS.Play className="w-6 h-6 text-[#102216]" />
              <span className="font-bold text-[#102216] text-lg uppercase tracking-wider">Watch Ad & Earn</span>
            </>
          )}
        </button>
      </div>

      {/* Ad Progress Bar */}
      {isWatching && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#13ec5b] transition-all duration-1000 ease-linear"
              style={{ width: `${((AD_DURATION - timer) / AD_DURATION) * 100}%` }}
            />
          </div>
          <p className="text-center text-[10px] text-gray-500 font-bold mt-2 uppercase tracking-widest">Do not close the app</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/withdraw')}
            className="glass p-6 rounded-[24px] flex flex-col items-start gap-3 hover:bg-white/10 transition-all border border-white/5"
          >
            <div className="p-3 bg-[#13ec5b]/20 rounded-xl">
              <ICONS.Wallet className="w-6 h-6 text-[#13ec5b]" />
            </div>
            <span className="font-bold text-lg">Redeem</span>
          </button>
          <button 
            onClick={() => navigate('/history')}
            className="glass p-6 rounded-[24px] flex flex-col items-start gap-3 hover:bg-white/10 transition-all border border-white/5"
          >
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <ICONS.History className="w-6 h-6 text-blue-400" />
            </div>
            <span className="font-bold text-lg">History</span>
          </button>
        </div>
      </div>

      {/* Refer Card */}
      <div className="glass rounded-[24px] p-6 flex items-center justify-between border border-[#13ec5b]/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2">
          <span className="bg-[#13ec5b]/20 text-[#13ec5b] text-[10px] font-bold px-2 py-1 rounded-full">+500 PTS</span>
        </div>
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-lg">Invite Friends</h4>
            <p className="text-gray-500 text-xs">Bonus points for every referral</p>
          </div>
        </div>
        <ICONS.ArrowRight className="w-6 h-6 text-gray-500" />
      </div>

      {/* Floating Reward Notification */}
      {rewardInfo && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full font-black text-xl animate-bounce z-50 shadow-2xl flex flex-col items-center gap-1 ${rewardInfo.isLucky ? 'bg-yellow-400 text-black border-4 border-yellow-500' : 'bg-[#13ec5b] text-[#102216]'}`}>
          {rewardInfo.isLucky && <span className="text-[10px] tracking-widest uppercase">LUCKY BONUS!</span>}
          <span>+{rewardInfo.points} PTS RECEIVED!</span>
        </div>
      )}

      {user.isAdmin && (
        <button 
          onClick={() => navigate('/admin')}
          className="mt-8 text-center text-[#13ec5b] font-bold underline text-sm"
        >
          Open Admin Panel
        </button>
      )}

      <div className="mt-auto pt-10 text-center">
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center justify-center gap-2 text-red-400/80 font-semibold hover:text-red-400 transition-colors mx-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log Out
        </button>
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
    </div>
  );
};

export default Dashboard;
