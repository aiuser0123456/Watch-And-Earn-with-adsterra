
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { User, Activity, WithdrawRequest, ActivityType, RequestStatus } from './types';
import { mockDb, loginWithGoogle, loginAsAdmin, auth, dbService } from './services/mockData';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Withdraw from './screens/Withdraw';
import History from './screens/History';
import AdminPanel from './screens/AdminPanel';
import Settings from './screens/Settings';
import TermsConditions from './screens/TermsConditions';
import PrivacyPolicy from './screens/PrivacyPolicy';
import { ICONS } from './constants';

interface ToastData {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  refreshUser: () => void;
  grantReward: () => Promise<{ points: number; isLucky: boolean }>;
  submitWithdraw: (points: number, email: string) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(mockDb.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastData | null>(null);

  // APP OPEN AD HANDLER
  useEffect(() => {
    if (user) {
      const win = window as any;
      if (win.AppInventor) {
        win.AppInventor.setWebViewString("show_app_open");
      }
    }
  }, [user]);

  // REWARD LISTENER
  useEffect(() => {
    const handleNativeReward = async (event: MessageEvent) => {
      if (event.data === "reward_granted" && user) {
        try {
          await grantReward();
        } catch (e) {
          console.error("Reward error:", e);
        }
      }
    };

    window.addEventListener('message', handleNativeReward);
    return () => window.removeEventListener('message', handleNativeReward);
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const cloudUser = await dbService.getUser(fbUser.uid);
        if (cloudUser) {
          setUser(cloudUser);
          mockDb.setCurrentUser(cloudUser);
        }
      } else {
        const current = mockDb.getCurrentUser();
        if (!current?.isAdmin) {
          setUser(null);
          mockDb.setCurrentUser(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshUser = async () => {
    if (!user) return;
    const updatedUser = await dbService.getUser(user.uid);
    if (updatedUser) {
      setUser({ ...updatedUser });
      mockDb.setCurrentUser(updatedUser);
    }
  };

  const grantReward = async (): Promise<{ points: number; isLucky: boolean }> => {
    if (!user) return { points: 0, isLucky: false };

    let reward = Math.floor(Math.random() * 3) + 1;
    let isLucky = Math.random() < 0.10; 
    if (isLucky) reward = 6;

    await dbService.updatePoints(user.uid, reward);
    await dbService.logActivity({
      userId: user.uid,
      type: ActivityType.WATCH_AD,
      points: reward,
      title: isLucky ? 'Lucky Bonus Ad Reward' : 'Video Ad Reward',
      status: isLucky ? 'Bonus' : 'Completed'
    });

    const updatedUser = { ...user, points: user.points + reward };
    setUser(updatedUser);
    mockDb.setCurrentUser(updatedUser);
    return { points: reward, isLucky };
  };

  const submitWithdraw = async (points: number, email: string) => {
    if (!user || user.points < points) throw new Error("Insufficient points");
    await dbService.addWithdrawRequest({
      userId: user.uid,
      userEmail: email,
      points: points,
      status: RequestStatus.PENDING,
      method: 'Google Play Redeem',
      amountInInr: points / 100
    });
    await dbService.updatePoints(user.uid, -points);
    const updatedUser = { ...user, points: user.points - points };
    setUser(updatedUser);
    mockDb.setCurrentUser(updatedUser);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#102216] flex flex-col items-center justify-center">
       <div className="w-8 h-8 border-4 border-[#13ec5b] border-t-transparent rounded-full animate-spin mb-4" />
       <p className="text-[#13ec5b] font-black uppercase tracking-widest text-[9px]">Emerald rewards Syncing...</p>
    </div>
  );

  return (
    <AppContext.Provider value={{ user, setUser, loading, refreshUser, grantReward, submitWithdraw, showToast }}>
      <Router>
        <div className="max-w-md mx-auto min-h-screen bg-[#102216] relative overflow-hidden flex flex-col shadow-2xl">
          {/* TOAST NOTIFICATION COMPONENT */}
          {toast && (
            <div className="fixed top-12 left-6 right-6 z-[200] animate-in slide-in-from-top-4 duration-300">
              <div className={`glass p-4 rounded-2xl flex items-center gap-3 border shadow-2xl ${
                toast.type === 'error' ? 'border-red-500/30' : 
                toast.type === 'success' ? 'border-[#13ec5b]/30' : 
                'border-blue-400/30'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                   toast.type === 'error' ? 'bg-red-500/10 text-red-500' : 
                   toast.type === 'success' ? 'bg-[#13ec5b]/10 text-[#13ec5b]' : 
                   'bg-blue-400/10 text-blue-400'
                }`}>
                  {toast.type === 'success' && <ICONS.Check className="w-4 h-4" />}
                  {toast.type === 'error' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>}
                  {toast.type === 'info' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>}
                </div>
                <p className="text-sm font-bold text-white leading-tight">{toast.message}</p>
              </div>
            </div>
          )}

          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/withdraw" element={user ? <Withdraw /> : <Navigate to="/login" />} />
            <Route path="/history" element={user ? <History /> : <Navigate to="/login" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.isAdmin ? <AdminPanel /> : <Navigate to="/" />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
