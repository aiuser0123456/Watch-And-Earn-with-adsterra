
import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/mockData';
import Layout from '../components/Layout';
import { WithdrawRequest, RequestStatus, User } from '../types';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { CONVERSION_FACTOR } from '../constants';

const AdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>(RequestStatus.PENDING);
  
  const [selectedReq, setSelectedReq] = useState<WithdrawRequest | null>(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Real-time Requests Listener
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(collection(db, "withdrawRequests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const reqs = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        } as WithdrawRequest));
        setRequests(reqs);
      },
      (error) => console.error("Admin Requests Error:", error)
    );
    return () => unsubscribe();
  }, []);

  // 2. Real-time Users Listener
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const u = snapshot.docs.map(doc => doc.data() as User);
        setUsers(u);
      },
      (error) => console.error("Admin Users Error:", error)
    );
    return () => unsubscribe();
  }, []);

  const handleAction = async (status: RequestStatus) => {
    if (!selectedReq) return;
    setIsProcessing(true);
    
    try {
      const docRef = doc(db, "withdrawRequests", selectedReq.id);
      await updateDoc(docRef, {
        status,
        code: status === RequestStatus.APPROVED ? redeemCode : undefined,
        processedAt: Date.now()
      });
      
      setSelectedReq(null);
      setRedeemCode('');
    } catch (e) {
      alert("Error updating database. Check your internet.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter(r => filterStatus === 'all' || r.status === filterStatus);
  
  const stats = {
    totalUsers: users.length,
    pendingPoints: requests.filter(r => r.status === RequestStatus.PENDING).reduce((sum, r) => sum + r.points, 0),
    totalPaid: requests.filter(r => r.status === RequestStatus.APPROVED).length,
    totalPointsSystem: users.reduce((sum, u) => sum + u.points, 0)
  };

  return (
    <Layout title="Admin Command" showBack={true} backTo="/">
      {/* Real-time Stats Header */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass p-5 rounded-[28px] border border-[#13ec5b]/10">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Live Users</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black">{stats.totalUsers}</span>
            <div className="w-2 h-2 rounded-full bg-[#13ec5b] animate-pulse" />
          </div>
        </div>
        <div className="glass p-5 rounded-[28px] border border-yellow-500/10">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Pending Payout</p>
          <p className="text-3xl font-black text-yellow-500">₹{(stats.pendingPoints * CONVERSION_FACTOR).toFixed(0)}</p>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex p-1.5 glass rounded-[24px] mb-6 border border-white/5">
        <button 
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3 font-bold rounded-2xl transition-all ${activeTab === 'requests' ? 'bg-[#13ec5b] text-[#102216] shadow-lg' : 'text-gray-400'}`}
        >
          Requests
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-3 font-bold rounded-2xl transition-all ${activeTab === 'users' ? 'bg-[#13ec5b] text-[#102216] shadow-lg' : 'text-gray-400'}`}
        >
          Users
        </button>
      </div>

      {activeTab === 'requests' ? (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: RequestStatus.PENDING, label: 'Pending' },
              { id: RequestStatus.APPROVED, label: 'Paid' },
              { id: RequestStatus.REJECTED, label: 'Rejected' },
              { id: 'all', label: 'All' }
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setFilterStatus(f.id as any)}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                  filterStatus === f.id 
                    ? 'bg-white/10 border-white/20 text-white' 
                    : 'bg-transparent border-white/5 text-gray-500'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredRequests.length > 0 ? (
              filteredRequests.map(req => (
                <div key={req.id} className="glass p-5 rounded-[30px] border border-white/5 group active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-xs text-[#13ec5b]">
                         {req.userEmail.charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <p className="font-bold text-sm truncate max-w-[150px]">{req.userEmail}</p>
                         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                           {new Date(req.createdAt).toLocaleDateString()}
                         </p>
                       </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      req.status === RequestStatus.PENDING ? 'bg-yellow-500/10 text-yellow-500' :
                      req.status === RequestStatus.APPROVED ? 'bg-[#13ec5b]/10 text-[#13ec5b]' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {req.status}
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Amount</p>
                      <p className="text-2xl font-black">₹{req.amountInInr} <span className="text-xs text-gray-500 font-normal">({req.points} PTS)</span></p>
                    </div>
                    
                    {req.status === RequestStatus.PENDING && (
                      <button 
                        onClick={() => setSelectedReq(req)}
                        className="bg-[#13ec5b] text-[#102216] px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_10px_20px_rgba(19,236,91,0.2)]"
                      >
                        Process
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-30">
                <p className="font-bold uppercase tracking-widest text-xs">No {filterStatus} Requests</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map(u => (
            <div key={u.uid} className="glass p-4 rounded-[24px] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={u.photoUrl} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                <div>
                  <p className="font-bold text-sm">{u.name}</p>
                  <p className="text-[10px] text-gray-500">{u.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-[#13ec5b]">{u.points.toLocaleString()}</p>
                <p className="text-[9px] text-gray-600 font-bold uppercase">Points</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm">
          <div className="glass w-full max-w-md p-8 rounded-t-[40px] border-t border-white/20">
            <h3 className="text-2xl font-black mb-1">Process Payment</h3>
            <p className="text-gray-400 text-sm mb-8">Send reward to <span className="text-white font-bold">{selectedReq.userEmail}</span></p>
            
            <div className="space-y-6">
              <input 
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="GP-XXXX-XXXX-XXXX"
                className="w-full h-16 bg-white/5 border-2 border-white/10 rounded-[22px] px-6 focus:border-[#13ec5b] outline-none font-mono text-lg tracking-widest"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => handleAction(RequestStatus.REJECTED)}
                  className="flex-1 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-[22px] font-black uppercase text-xs"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAction(RequestStatus.APPROVED)}
                  className="flex-[2] h-16 bg-[#13ec5b] text-[#102216] rounded-[22px] font-black uppercase text-xs"
                >
                  {isProcessing ? 'Saving...' : 'Approve & Pay'}
                </button>
              </div>
              <button onClick={() => setSelectedReq(null)} className="w-full py-2 text-gray-600 font-black text-[10px] uppercase">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminPanel;
