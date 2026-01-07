
import React, { useState, useEffect } from 'react';
import { db } from '../services/mockData';
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

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    // Real-time Activity Listener (Latest 10)
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

    const unsubActivity = onSnapshot(qActivity, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
      setActivities(data);
      if (tab === 'activity') setLoading(false);
    });

    const unsubWithdrawals = onSnapshot(qWithdrawals, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawRequest));
      setWithdrawals(data);
      if (tab === 'withdrawals') setLoading(false);
    });

    return () => {
      unsubActivity();
      unsubWithdrawals();
    };
  }, [user, tab]);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  if (!user) return null;

  return (
    <Layout title="Latest History" rightAction={
      <div className="flex flex-col items-end">
        <span className="text-[10px] text-[#13ec5b] font-black uppercase tracking-tighter">Real-time Sync</span>
        <div className="w-1.5 h-1.5 rounded-full bg-[#13ec5b] animate-pulse" />
      </div>
    }>
      {/* Tabs */}
      <div className="flex p-1.5 glass rounded-3xl mb-8 border border-white/5">
        <button 
          onClick={() => setTab('activity')}
          className={`flex-1 py-3.5 font-black text-xs uppercase tracking-widest rounded-[20px] transition-all ${tab === 'activity' ? 'bg-[#13ec5b] text-[#102216] shadow-lg' : 'text-gray-500'}`}
        >
          Activity
        </button>
        <button 
          onClick={() => setTab('withdrawals')}
          className={`flex-1 py-3.5 font-black text-xs uppercase tracking-widest rounded-[20px] transition-all ${tab === 'withdrawals' ? 'bg-[#13ec5b] text-[#102216] shadow-lg' : 'text-gray-500'}`}
        >
          Requests
        </button>
      </div>

      <div className="mb-4 px-2">
        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">Showing only latest 10 entries</p>
      </div>

      <div className="space-y-4 pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-8 h-8 border-4 border-[#13ec5b] border-t-transparent rounded-full animate-spin" />
             <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Updating Feed...</p>
          </div>
        ) : (
          tab === 'activity' ? (
            activities.length > 0 ? (
              activities.map((item) => (
                <div key={item.id} className="glass p-5 rounded-[28px] border border-white/5 flex items-center justify-between group active:scale-95 transition-transform">
                  <div className="flex gap-4 items-center">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      item.type === ActivityType.WATCH_AD ? 'bg-blue-500/10 text-blue-400' :
                      item.type === ActivityType.DAILY_CHECKIN ? 'bg-purple-500/10 text-purple-400' : 'bg-[#13ec5b]/10 text-[#13ec5b]'
                    }`}>
                       {item.type === ActivityType.WATCH_AD ? <ICONS.Play className="w-5 h-5" /> : <ICONS.Check className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight text-white/90">{item.title}</h4>
                      <p className="text-gray-600 text-[10px] font-bold mt-1 uppercase">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className={`font-black text-base ${item.points > 0 ? 'text-[#13ec5b]' : 'text-red-400'}`}>
                       {item.points > 0 ? `+${item.points}` : item.points}
                     </p>
                  </div>
                </div>
              ))
            ) : (
               <div className="text-center py-20 opacity-20">
                 <p className="text-sm font-black uppercase tracking-widest">Feed Empty</p>
               </div>
            )
          ) : (
            withdrawals.length > 0 ? (
              withdrawals.map((req) => (
                <div key={req.id} className="glass p-5 rounded-[28px] border border-white/5 relative overflow-hidden group active:scale-95 transition-transform">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                        req.status === RequestStatus.PENDING ? 'bg-yellow-500/10 text-yellow-500' :
                        req.status === RequestStatus.APPROVED ? 'bg-[#13ec5b]/10 text-[#13ec5b]' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {req.status === RequestStatus.PENDING ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> : <ICONS.Check className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white/90">₹{req.amountInInr} Card</h4>
                        <p className="text-gray-600 text-[10px] font-bold uppercase">{formatDate(req.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-gray-400">-{req.points}</p>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${
                        req.status === RequestStatus.PENDING ? 'bg-yellow-500/10 text-yellow-500' :
                        req.status === RequestStatus.APPROVED ? 'bg-[#13ec5b]/10 text-[#13ec5b]' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
               <div className="text-center py-20 opacity-20">
                 <p className="text-sm font-black uppercase tracking-widest">No Requests</p>
               </div>
            )
          )
        )}
      </div>
    </Layout>
  );
};

export default History;
