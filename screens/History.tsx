
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
    
    const qActivity = query(
      collection(db, "activity"), 
      where("userId", "==", user.uid), 
      orderBy("createdAt", "desc"), 
      limit(10)
    );

    const qWithdrawals = query(
      collection(db, "withdrawRequests"), 
      where("userId", "==", user.uid), 
      orderBy("createdAt", "desc"), 
      limit(10)
    );

    const unsubActivity = onSnapshot(qActivity, (snap) => {
      setActivities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity)));
      if (tab === 'activity') setLoading(false);
    }, (e) => { 
      if (e.code === 'failed-precondition') setIndexError(true); 
      setLoading(false); 
    });

    const unsubWithdrawals = onSnapshot(qWithdrawals, (snap) => {
      setWithdrawals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawRequest)));
      if (tab === 'withdrawals') setLoading(false);
    }, (e) => { 
      if (e.code === 'failed-precondition') setIndexError(true); 
      setLoading(false); 
    });

    return () => { 
      unsubActivity(); 
      unsubWithdrawals(); 
    };
  }, [user, tab]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Redeem Code Copied!");
  };

  const formatDate = (ts: number) => new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }).format(new Date(ts));

  if (!user) return null;

  return (
    <Layout title="History">
      <div className="flex p-1.5 glass rounded-3xl mb-8 border border-white/5">
        <button 
          onClick={() => setTab('activity')} 
          className={`flex-1 py-3.5 font-black text-xs uppercase rounded-[20px] transition-all ${tab === 'activity' ? 'bg-[#13ec5b] text-[#102216]' : 'text-gray-500'}`}
        >
          Activity
        </button>
        <button 
          onClick={() => setTab('withdrawals')} 
          className={`flex-1 py-3.5 font-black text-xs uppercase rounded-[20px] transition-all ${tab === 'withdrawals' ? 'bg-[#13ec5b] text-[#102216]' : 'text-gray-500'}`}
        >
          Payouts
        </button>
      </div>

      <div className="space-y-4 pb-10">
        {indexError ? (
          <div className="glass p-8 rounded-3xl border border-yellow-500/30 text-center">
            <p className="text-yellow-400 font-black text-xs uppercase tracking-widest">Index Required</p>
            <p className="text-gray-500 text-[10px] mt-2 leading-relaxed">Please check browser console for the direct link to create indexes.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20 animate-spin">
            <div className="w-8 h-8 border-4 border-[#13ec5b] border-t-transparent rounded-full" />
          </div>
        ) : tab === 'activity' ? (
          activities.length > 0 ? activities.map(item => (
            <div key={item.id} className="glass p-5 rounded-[28px] flex items-center justify-between border border-white/5 animate-in slide-in-from-bottom-2">
              <div className="flex gap-4 items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === ActivityType.WATCH_AD ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  <ICONS.Play className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-gray-600 text-[10px] font-bold uppercase">{formatDate(item.createdAt)}</p>
                </div>
              </div>
              <p className={`font-black ${item.points > 0 ? 'text-[#13ec5b]' : 'text-red-400'}`}>
                {item.points > 0 ? `+${item.points}` : item.points}
              </p>
            </div>
          )) : (
            <div className="text-center py-20 opacity-20">
              <p className="text-sm font-black uppercase tracking-widest">No Activity Yet</p>
            </div>
          )
        ) : (
          withdrawals.length > 0 ? withdrawals.map(req => (
            <div key={req.id} className="glass p-5 rounded-[28px] border border-white/5 animate-in slide-in-from-bottom-2">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-sm">₹{req.amountInInr} Card</h4>
                  <p className="text-gray-600 text-[10px] font-bold uppercase">{formatDate(req.createdAt)}</p>
                </div>
                <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                  req.status === RequestStatus.PENDING ? 'bg-yellow-500/10 text-yellow-500' : 
                  req.status === RequestStatus.APPROVED ? 'bg-[#13ec5b]/10 text-[#13ec5b]' : 
                  'bg-red-500/10 text-red-500'
                }`}>
                  {req.status}
                </span>
              </div>
              
              {req.status === RequestStatus.APPROVED && req.code && (
                <div className="mt-4 p-4 bg-[#13ec5b]/5 border border-[#13ec5b]/20 rounded-2xl">
                  <p className="text-[9px] text-[#13ec5b] font-black uppercase mb-1 tracking-widest">Reward Code:</p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono font-bold text-white tracking-widest text-base truncate">{req.code}</span>
                    <button 
                      onClick={() => copyToClipboard(req.code!)} 
                      className="p-2.5 bg-[#13ec5b] text-[#102216] rounded-xl active:scale-90 transition-transform shadow-lg"
                    >
                      <ICONS.Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="text-center py-20 opacity-20">
              <p className="text-sm font-black uppercase tracking-widest">No Payouts Yet</p>
            </div>
          )
        )}
      </div>
    </Layout>
  );
};

export default History;
