
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { User, Activity, WithdrawRequest, ActivityType, RequestStatus } from './types';
import { mockDb, loginWithGoogle, loginAsAdmin, auth } from './services/mockData';
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
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        // Find local user data or use stored mock data
        const localUser = mockDb.getUsers().find(u => u.uid === fbUser.uid);
        if (localUser) {
          setUser(localUser);
          mockDb.setCurrentUser(localUser);
        }
      } else {
        // If not logged in, but we have an admin demo session, keep it
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

  const refreshUser = () => {
    const updatedUser = mockDb.getUsers().find(u => u.uid === user?.uid);
    if (updatedUser) {
      setUser({ ...updatedUser });
      mockDb.setCurrentUser(updatedUser);
    }
  };

  const grantReward = async (): Promise<{ points: number; isLucky: boolean }> => {
    return new Promise((resolve) => {
      if (!user) return resolve({ points: 0, isLucky: false });

      let reward = Math.floor(Math.random() * 3) + 1;
      let isLucky = false;

      const today = new Date().setHours(0, 0, 0, 0);
      const dailyActivities = mockDb.getActivity().filter(
        a => a.userId === user.uid && a.createdAt >= today
      );
      const luckyCountToday = dailyActivities.filter(
        a => a.status === 'Bonus' && a.points === 6
      ).length;

      if (luckyCountToday < 2 && Math.random() < 0.10) {
        reward = 6;
        isLucky = true;
      }

      const updatedUser = { ...user, points: user.points + reward };
      const newActivity: Activity = {
        id: Math.random().toString(),
        userId: user.uid,
        type: ActivityType.WATCH_AD,
        points: reward,
        title: isLucky ? 'Lucky Bonus Reward' : 'Ad Reward',
        createdAt: Date.now(),
        status: isLucky ? 'Bonus' : 'Completed'
      };
      
      const activities = mockDb.getActivity();
      mockDb.saveActivity([newActivity, ...activities]);
      
      const users = mockDb.getUsers();
      const idx = users.findIndex(u => u.uid === user.uid);
      if (idx > -1) {
        users[idx] = updatedUser;
        mockDb.saveUsers(users);
      }
      
      setUser(updatedUser);
      mockDb.setCurrentUser(updatedUser);
      resolve({ points: reward, isLucky });
    });
  };

  const submitWithdraw = async (points: number, email: string): Promise<void> => {
    if (!user || user.points < points) throw new Error("Insufficient points");
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRequest: WithdrawRequest = {
          id: 'WR-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          userId: user.uid,
          userEmail: email,
          points: points,
          status: RequestStatus.PENDING,
          method: 'Google Play Redeem',
          createdAt: Date.now(),
          amountInInr: points / 100
        };
        const requests = mockDb.getRequests();
        mockDb.saveRequests([newRequest, ...requests]);
        const updatedUser = { ...user, points: user.points - points };
        const newActivity: Activity = {
          id: Math.random().toString(),
          userId: user.uid,
          type: ActivityType.WITHDRAWAL,
          points: -points,
          title: 'Reward Redemption',
          createdAt: Date.now(),
          status: 'Pending'
        };
        const activities = mockDb.getActivity();
        mockDb.saveActivity([newActivity, ...activities]);
        const users = mockDb.getUsers();
        const idx = users.findIndex(u => u.uid === user.uid);
        if (idx > -1) { users[idx] = updatedUser; mockDb.saveUsers(users); }
        setUser(updatedUser);
        mockDb.setCurrentUser(updatedUser);
        resolve();
      }, 1500);
    });
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
