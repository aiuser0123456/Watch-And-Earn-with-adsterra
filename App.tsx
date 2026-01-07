
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

  // Sync state with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch real-time data from Firestore
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

    let reward = Math.floor(Math.random() * 3) + 1;
    let isLucky = false;

    // Check lucky bonus probability
    if (Math.random() < 0.10) {
      reward = 6;
      isLucky = true;
    }

    try {
      // 1. Update Points in Firestore
      await dbService.updatePoints(user.uid, reward);
      
      // 2. Log Activity in Firestore
      await dbService.logActivity({
        userId: user.uid,
        type: ActivityType.WATCH_AD,
        points: reward,
        title: isLucky ? 'Lucky Bonus Reward' : 'Ad Reward',
        status: isLucky ? 'Bonus' : 'Completed'
      });

      // 3. Update Local State
      const updatedUser = { ...user, points: user.points + reward };
      setUser(updatedUser);
      mockDb.setCurrentUser(updatedUser);

      return { points: reward, isLucky };
    } catch (e) {
      console.error("Failed to grant reward:", e);
      throw e;
    }
  };

  const submitWithdraw = async (points: number, email: string): Promise<void> => {
    if (!user || user.points < points) throw new Error("Insufficient points");
    
    try {
      // 1. Create withdrawal request in Firestore
      await dbService.addWithdrawRequest({
        userId: user.uid,
        userEmail: email,
        points: points,
        status: RequestStatus.PENDING,
        method: 'Google Play Redeem',
        amountInInr: points / 100
      });

      // 2. Deduct points in Firestore
      await dbService.updatePoints(user.uid, -points);

      // 3. Log as negative activity
      await dbService.logActivity({
        userId: user.uid,
        type: ActivityType.WITHDRAWAL,
        points: -points,
        title: 'Reward Redemption',
        status: 'Pending'
      });

      // 4. Update UI
      const updatedUser = { ...user, points: user.points - points };
      setUser(updatedUser);
      mockDb.setCurrentUser(updatedUser);
    } catch (e) {
      console.error("Withdrawal failed:", e);
      throw e;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#102216] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#13ec5b] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#13ec5b] font-bold tracking-widest animate-pulse">EMERALD REWARDS</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, setUser, loading, refreshUser, grantReward, submitWithdraw }}>
      <Router>
        <div className="max-w-md mx-auto min-h-screen bg-[#102216] relative overflow-hidden flex flex-col">
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
