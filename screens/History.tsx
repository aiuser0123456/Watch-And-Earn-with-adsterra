
import React, { useState, useEffect } from 'react';
import { dbService } from '../services/mockData';
import { useApp } from '../App';
import Layout from '../components/Layout';
import { Activity, WithdrawRequest, ActivityType, RequestStatus } from '../types';
import { ICONS } from '../constants';

const History: React.FC = () => {
  const { user } = useApp();
  const [tab, setTab] = useState<'activity' | 'withdrawals'>('activity');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [acts, reqs] = await Promise.all([
            dbService.getActivities(user.uid),
            dbService.getWithdrawRequests(user.uid)
          ]);
          setActivities(acts);
          setWithdrawals(reqs);
        } catch (e) {
          console.error("History fetch failed:", e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const getRelativeDay = (timestamp: number) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const date = new Date(timestamp).setHours(0, 0, 0, 0);
    if (today === date) return 'TODAY';
    if (today - 86400000 === date) return 'YESTERDAY';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(timestamp)).toUpperCase();
  };

  if (!user) return null;

  return (
    <Layout title="History" rightAction={
      <div className="p-2 glass rounded-full">
        <ICONS.History className="w-6 h-6 text-[#13ec5b]" />
      </div>
    }>
      {/* Tabs */}
      <div className="flex p-1 glass rounded-2xl mb-8">
        <button 
          onClick={() => setTab('activity')}
          className={`flex-1 py-3 font-bold rounded-xl transition-all ${tab === 'activity' ? 'bg-[#13ec5b] text-[#102216] shadow-lg' : 'text-gray-400'}`}
        >
          Activity
        </button>
        <button 
          onClick={() => setTab('withdrawals')}
          className={`flex-1 py-3 font-bold rounded-xl transition-all ${tab === 'withdrawals' ? 'bg-[#13ec5b] text-[#102216] shadow-lg' : 'text-gray-400'}`}
        >
          Withdrawals
        </button>
      </div>

      {/* List Content */}
      <div className="space-y-6 min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-10 h-10 border-4 border-[#13ec5b] border-t-transparent rounded-full animate-spin" />
             <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing Cloud...</p>
          </div>
        ) : (
          tab === 'activity' ? (
            activities.length > 0 ? (
              activities.map((item, idx) => {
                const showDate = idx === 0 || getRelativeDay(item.createdAt) !== getRelativeDay(activities[idx - 1].createdAt);
                return (
                  <div key={item.id}>
                    {showDate && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-[#13ec5b]" />
                        <span className="text-xs font-black text-gray-500 tracking-widest">{getRelativeDay(item.createdAt)}</span>
                      </div>
                    )}
                    <div className="glass p-5 rounded-[24px] border border-white/5 mb-3 flex items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          item.type === ActivityType.WATCH_AD ? 'bg-blue-500/20 text-blue-400' :
                          item.type === ActivityType.REFERRAL ? 'bg-orange-500/20 text-orange-400' :
                          item.type === ActivityType.DAILY_CHECKIN ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                           {item.type === ActivityType.WATCH_AD ? <ICONS.Play className="w-6 h-6" /> : 
                            item.type === ActivityType.REFERRAL ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> : 
                            item.type === ActivityType.DAILY_CHECKIN ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg> : 
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                           }
                        </div>
                        <div>
                          <h4 className="font-bold text-base leading-tight">{item.title}</h4>
                          <p className="text-gray-500 text-xs mt-1">{formatDate(item.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className={`font-black text-lg ${item.points > 0 ? 'text-[#13ec5b]' : 'text-red-400'}`}>
                           {item.points > 0 ? `+${item.points}` : item.points} PTS
                         </p>
                         <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-gray-500 font-bold uppercase">{item.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
               <div className="text-center py-20 opacity-30">
                 <p className="text-xl font-bold">No activity yet</p>
               </div>
            )
          ) : (
            withdrawals.length > 0 ? (
              withdrawals.map((req) => (
                <div key={req.id} className="glass p-5 rounded-[24px] border border-white/5 relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    req.status === RequestStatus.PENDING ? 'bg-yellow-500' :
                    req.status === RequestStatus.APPROVED ? 'bg-[#13ec5b]' : 'bg-red-500'
                  }`} />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        req.status === RequestStatus.PENDING ? 'bg-yellow-500/20 text-yellow-500' :
                        req.status === RequestStatus.APPROVED ? 'bg-[#13ec5b]/20 text-[#13ec5b]' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {req.status === RequestStatus.PENDING ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> : 
                         req.status === RequestStatus.APPROVED ? <ICONS.Check className="w-6 h-6" /> : 
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
                        }
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-tight">Google Play Card</h4>
                        <p className="text-gray-500 text-xs mt-1">{formatDate(req.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg text-gray-300">-{req.points.toLocaleString()} PTS</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        req.status === RequestStatus.PENDING ? 'bg-yellow-500/10 text-yellow-500' :
                        req.status === RequestStatus.APPROVED ? 'bg-[#13ec5b]/10 text-[#13ec5b]' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>

                  {req.status === RequestStatus.PENDING && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-2">
                         <div className="w-[60%] h-full bg-gradient-to-r from-yellow-600 to-yellow-400" />
                      </div>
                      <p className="text-[10px] text-gray-500 italic">Processing in the cloud</p>
                    </div>
                  )}

                  {req.status === RequestStatus.APPROVED && req.code && (
                    <div className="mt-4 p-4 glass rounded-xl border border-[#13ec5b]/20 bg-[#13ec5b]/5">
                      <p className="text-[10px] text-[#13ec5b] font-black uppercase mb-2 tracking-widest">YOUR REDEEM CODE</p>
                      <div className="flex items-center justify-between">
                         <code className="text-base font-bold tracking-widest">{req.code}</code>
                         <button onClick={() => {
                            navigator.clipboard.writeText(req.code!);
                            alert('Code copied to clipboard!');
                         }} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <ICONS.Copy className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
               <div className="text-center py-20 opacity-30">
                 <p className="text-xl font-bold">No withdrawals yet</p>
               </div>
            )
          )
        )}
        
        {!loading && (
          <div className="text-center py-10">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">End of history</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default History;
