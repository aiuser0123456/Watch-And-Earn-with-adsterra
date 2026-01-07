
import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/mockData';
import { useApp } from '../App';
import Layout from '../components/Layout';
import { Activity, WithdrawRequest, ActivityType, RequestStatus } from '../types';
import { ICONS } from '../constants';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';

const History: React.FC = () => {
  const { user } = useApp();
  const [tab, setTab] = useState<'activity' | 'withdrawals'>('activity');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [indexError, setIndexError] = useState(false);

  useEffect(() => {
    if (!user || !auth.currentUser) return;
    setLoading(true);
    setIndexError(false);
    
    const qActivity = query(collection(db, "activity"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(10));
    const qWithdrawals = query(collection(db, "withdrawRequests"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(10));

    const unsubActivity = onSnapshot(qActivity, (snap) => {
      setActivities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity)));
      if (tab === 'activity') setLoading(false);
    }, (e) => { if (e.code === 'failed-precondition') setIndexError(true); setLoading(false); });

    const unsubWithdrawals = onSnapshot(qWithdrawals, (snap) => {
      setWithdrawals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawRequest)));
      if (tab === 'withdrawals') setLoading(false);
    }, (e) => { if (e.code === 'failed-precondition') setIndexError(true); setLoading(false); });

    return () => { unsubActivity(); unsubWithdrawals(); };
  }, [user, tab]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Redeem Code Copied!");
  };

  const formatDate = (ts: number) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ts));

  if (!user) return null;

  return (
    <Layout title="History">
      <div className="flex p-1.5 glass rounded-3xl mb-8 border border-white/5">
        <button onClick={() => setTab('activity')} className={`flex-1 py-3.5 font-black text-xs uppercase rounded-[20px] ${tab === 'activity' ? 'bg-[#13ec5b] text-[#102216]' : 'text-gray-500'}`}>Activity</button>
        <button onClick={() => setTab('withdrawals')} className={`flex-1 py-3.5 font-black text-xs uppercase rounded-[20px] ${tab === 'withdrawals' ? 'bg-[#13ec5b] text-[#102216]' : 'text-gray-500'}`}>Payouts</button>
      </div>

      <div className="space-y-4 pb-10">
        {indexError ? (
          <div className="glass p-8 rounded-3xl border border-yellow-500/30 text