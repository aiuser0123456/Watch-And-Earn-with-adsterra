
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

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  refreshUser: () => void;
  grantReward: () => Promise<{ points: number; isLucky: boolean }>;
  submitWithdraw: (points: number, email: string) => Promise<void>;
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

  // GLOBAL NATIVE REWARD LISTENER
  useEffect(() => {
    const handleNativeReward = async (event: MessageEvent) => {
      // String must match exactly what the Android Blocks send
      if (event.data === "reward_granted" && user) {
        console.log("Reward signal received from Native Bridge");
        try {
          await grantReward();
        } catch (e) {
          console.error("Reward processing error:", e);
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

    // Standard reward: 1-3 points. Lucky reward: 6 points.
    let reward = Math.floor(Math.random() * 3) + 1;
    let isLucky = Math.random() < 0.10; // 10% chance
    if (isLucky) reward = 6;

    // Update cloud and local state
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

  const submitWithdraw = async (points: number, email: string): Promise<void> => {
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
    await dbService.logActivity({
      userId: user.uid,
      type: ActivityType.WITHDRAWAL,
      points: -points,
      title: 'Requested Withdrawal',
      status: 'Pending'
    });
    const updatedUser = { ...user, points: user.points - points };
    setUser(updatedUser);
    mockDb.setCurrentUser(updatedUser);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#102216] flex flex-col items-center justify-center">
       <div className="w-10 h-10 border-4 border-[#13ec5b] border-t-transparent rounded-full animate-spin mb-4" />
       <p className="text-[#13ec5b] font-black uppercase tracking-[0.3em] text-[10px]">Syncing Session...</p>
    </div>
  );

  return (
    <AppContext.Provider value={{ user, setUser, loading, refreshUser, grantReward, submitWithdraw }}>
      <Router>
        <div className="max-w-md mx-auto min-h-screen bg-[#102216] relative overflow-hidden flex flex-col shadow-2xl">
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
