
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
import ConfirmationDialog from '../components/ConfirmationDialog';

const AdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>(RequestStatus.PENDING);
  
  const [selectedReq, setSelectedReq] = useState<WithdrawRequest | null>(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [showConfirmAction, setShowConfirmAction] = useState<{status: RequestStatus, label: string} | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "withdrawRequests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawRequest)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as User));
    });
    return () => unsubscribe();
  }, []);

  const initiateAction = (status: RequestStatus) => {
    if (status === RequestStatus.APPROVED && !redeemCode.trim()) {
      alert("Error: You must enter a Redeem Code before approving.");
      return;
    }
    setShowConfirmAction({ status, label: status === RequestStatus.APPROVED ? 'Approve' : 'Reject' });
  };

  const handleActionExecution = async () => {
    if (!selectedReq || !showConfirmAction) return;
    const { status } = showConfirmAction;
    
    setIsProcessing(true);
    setShowConfirmAction(null);
    
    try {
      const docRef = doc(db, "withdrawRequests", selectedReq.id);
      
      const updateData: any = {
        status,
        processedAt: Date.now()
      };
      
      if (status === RequestStatus.APPROVED) {
        updateData.code = redeemCode.trim();
      }

      await updateDoc(docRef, updateData);
      setSelectedReq(null);
      setRedeemCode('');
    } catch (e) {
      console.error(e);
      alert("Database error. Please check your admin permissions.");
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = {
    totalUsers: users.length,
    pendingPoints: requests.filter(r => r.status === RequestStatus.PENDING).reduce((sum, r) => sum + r.points, 0),
    totalPaid: requests.filter(r => r.status === RequestStatus.APPROVED).length
  };

  return (
    <Layout title="Admin Command" showBack={true} backTo="/">
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="glass p-5 rounded-[28px] border border-[#13ec5b]/10">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Live Users</p>
          <span className="text-3xl font-black">{stats.totalUsers}</span>
        </div>
        <div className="glass p-5 rounded-[28px] border border-yellow-500/10">
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Unpaid Total</p>
          <p className="text-3xl font-black text-yellow-500">₹{(stats.pendingPoints * CONVERSION_FACTOR).toFixed(0)}</p>
        </div>
      </div>

      <div className="flex p-1.5 glass rounded-[24px] mb-6 border border-white/5">
        <button onClick={() => setActiveTab('requests')} className={`flex-1 py-3 font-bold rounded-2xl transition-all ${activeTab === 'requests' ? 'bg-[#13ec5b] text-[#102216]' : 'text-gray-400'}`}>Requests</button>
        <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 font-bold rounded-2xl transition-all ${activeTab === 'users' ? 'bg-[#13ec5b] text-[#102216]' : 'text-gray-400'}`}>Users</button>
      </div>

      {activeTab === 'requests' ? (
        <div className="space-y-4">
          {requests.filter(r => filterStatus === 'all' || r.status === filterStatus).map(req => (
            <div key={req.id} className="glass p-5 rounded-[30px] border border-white/5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-sm truncate max-w-[180px]">{req.userEmail}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${req.status === RequestStatus.PENDING ? 'bg-yellow-500/10 text-yellow-500' : req.status === RequestStatus.APPROVED ? 'bg-[#13ec5b]/10 text-[#13ec5b]' : 'bg-red-500/10 text-red-400'}`}>{req.status}</div>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-2xl font-black">₹{req.amountInInr} <span className="text-xs text-gray-500 font-normal">({req.points} PTS)</span></p>
                {req.status === RequestStatus.PENDING && (
                  <button onClick={() => setSelectedReq(req)} className="bg-[#13ec5b] text-[#102216] px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg">Process</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {users.map(u => (
            <div key={u.uid} className="glass p-4 rounded-[24px] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={u.photoUrl} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                <div><p className="font-bold text-sm">{u.name}</p><p className="text-[10px] text-gray-500">{u.email}</p></div>
              </div>
              <p className="font-black text-[#13ec5b]">{u.points.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md p-8 rounded-[40px] border border-white/20">
            <h3 className="text-2xl font-black mb-1">Process Reward</h3>
            <p className="text-gray-400 text-sm mb-6">User: <span className="text-white font-bold">{selectedReq.userEmail}</span></p>
            
            <div className="space-y-6">
              <div>
                <label className="text-gray-500 text-[10px] font-black uppercase block mb-2">Redeem Code (Required for Approval)</label>
                <input 
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="GPLAY-XXXX-XXXX"
                  className="w-full h-16 bg-white/5 border-2 border-white/10 rounded-[22px] px-6 focus:border-[#13ec5b] outline-none font-mono text-lg"
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => initiateAction(RequestStatus.REJECTED)} className="flex-1 h-16 bg-red-500/10 text-red-500 rounded-[22px] font-black uppercase text-xs">Decline</button>
                <button 
                  onClick={() => initiateAction(RequestStatus.APPROVED)} 
                  disabled={!redeemCode.trim()}
                  className="flex-[2] h-16 bg-[#13ec5b] text-[#102216] rounded-[22px] font-black uppercase text-xs disabled:opacity-30"
                >
                  Confirm & Pay
                </button>
              </div>
              <button onClick={() => setSelectedReq(null)} className="w-full py-2 text-gray-600 font-bold uppercase text-[10px]">Close Window</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog 
        isOpen={!!showConfirmAction}
        title={`${showConfirmAction?.label} Request?`}
        message={`Are you sure you want to ${showConfirmAction?.label.toLowerCase()} this withdrawal for ₹${selectedReq?.amountInInr}?`}
        confirmText={`Yes, ${showConfirmAction?.label}`}
        onConfirm={handleActionExecution}
        onCancel={() => setShowConfirmAction(null)}
        isDanger={showConfirmAction?.status === RequestStatus.REJECTED}
      />
    </Layout>
  );
};

export default AdminPanel;
