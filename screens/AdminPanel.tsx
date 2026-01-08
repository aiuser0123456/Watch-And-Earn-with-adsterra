
import React, { useState, useEffect } from 'react';
import { db, auth, dbService } from '../services/mockData';
import { useApp } from '../App';
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
  const { showToast } = useApp();
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>(RequestStatus.PENDING);
  
  const [selectedReq, setSelectedReq] = useState<WithdrawRequest | null>(null);
  const [redeemCode, setRedeemCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [showConfirmAction, setShowConfirmAction] = useState<{status: RequestStatus, label: string} | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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
      showToast("Error: Redeem Code required.", "error");
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
      showToast(`Request ${status} successfully.`, "success");
    } catch (e) {
      console.error(e);
      showToast("Database error. Action failed.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = async () => {
    setShowClearConfirm(false);
    setIsProcessing(true);
    try {
      await dbService.clearProcessedRequests();
      showToast("Cleared all processed requests.", "success");
    } catch (e) {
      showToast("Failed to clear history.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const stats = {
    totalUsers: users.length,
    pendingPoints: requests.filter(r => r.status === RequestStatus.PENDING).reduce((sum, r) => sum + r.points, 0),
    processedCount: requests.filter(r => r.status !== RequestStatus.PENDING).length
  };

  return (
    <Layout title="Admin Command" showBack={true} backTo="/">
      {/* Stats Display */}
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

      {/* Tabs */}
      <div className="flex p-1.5 glass rounded-[24px] mb-6 border border-white/5">
        <button onClick={() => setActiveTab('requests')} className={`flex-1 py-3 font-bold rounded-2xl transition-all ${activeTab === 'requests' ? 'bg-[#13ec5b] text-[#102216]' : 'text-gray-400'}`}>Requests</button>
        <button onClick={() => setActiveTab('users')} className={`flex-1 py-3 font-bold rounded-2xl transition-all ${activeTab === 'users' ? 'bg-[#13ec5b] text-[#102216]' : 'text-gray-400'}`}>Users</button>
      </div>

      {activeTab === 'requests' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
               {[RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.REJECTED, 'all'].map(s => (
                 <button 
                  key={s} 
                  onClick={() => setFilterStatus(s as any)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest transition-all ${filterStatus === s ? 'bg-white text-[#102216] border-white' : 'border-white/10 text-gray-500'}`}
                 >
                   {s}
                 </button>
               ))}
            </div>
            
            {filterStatus !== RequestStatus.PENDING && stats.processedCount > 0 && (
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 active:scale-95 transition-all"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-4 pb-20">
            {requests.filter(r => filterStatus === 'all' || r.status === filterStatus).map(req => (
              <div key={req.id} className="glass p-5 rounded-[30px] border border-white/5 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-sm truncate max-w-[180px]">{req.userEmail}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    req.status === RequestStatus.PENDING ? 'bg-yellow-500/10 text-yellow-500' : 
                    req.status === RequestStatus.APPROVED ? 'bg-[#13ec5b]/10 text-[#13ec5b]' : 
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {req.status}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-black">₹{req.amountInInr.toFixed(0)}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{req.points} PTS</p>
                  </div>
                  {req.status === RequestStatus.PENDING && (
                    <button 
                      onClick={() => { setSelectedReq(req); setRedeemCode(''); }} 
                      className="bg-[#13ec5b] text-[#102216] px-6 py-2.5 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all"
                    >
                      Process
                    </button>
                  )}
                  {req.status === RequestStatus.APPROVED && req.code && (
                    <div className="text-right">
                      <p className="text-[8px] text-gray-600 font-black uppercase mb-0.5">Paid with code:</p>
                      <p className="font-mono text-[10px] font-bold text-white tracking-widest bg-white/5 px-2 py-1 rounded-lg border border-white/10">{req.code}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4 pb-20">
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

      {/* Modal for Processing */}
      {selectedReq && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md p-8 rounded-[40px] border border-white/20 animate-in slide-in-from-bottom duration-300">
            <h3 className="text-2xl font-black mb-1">Process Payout</h3>
            <p className="text-gray-400 text-sm mb-6 truncate">To: <span className="text-white font-bold">{selectedReq.userEmail}</span></p>
            
            <div className="space-y-6">
              <div>
                <label className="text-gray-500 text-[10px] font-black uppercase block mb-2 tracking-widest">Google Play Code</label>
                <input 
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  placeholder="GPLAY-XXXX-XXXX"
                  className="w-full h-16 bg-white/5 border-2 border-white/10 rounded-[22px] px-6 focus:border-[#13ec5b] outline-none font-mono text-lg tracking-widest transition-all"
                />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => initiateAction(RequestStatus.REJECTED)} 
                  className="flex-1 h-16 bg-red-500/10 text-red-500 rounded-[22px] font-black uppercase text-xs border border-red-500/20"
                >
                  Decline
                </button>
                <button 
                  onClick={() => initiateAction(RequestStatus.APPROVED)} 
                  disabled={!redeemCode.trim()}
                  className="flex-[2] h-16 bg-[#13ec5b] text-[#102216] rounded-[22px] font-black uppercase text-xs disabled:opacity-30 shadow-xl transition-all"
                >
                  Confirm & Pay
                </button>
              </div>
              <button onClick={() => setSelectedReq(null)} className="w-full py-2 text-gray-600 font-bold uppercase text-[10px] tracking-widest">Cancel Action</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation for Action */}
      <ConfirmationDialog 
        isOpen={!!showConfirmAction}
        title={`${showConfirmAction?.label} Request?`}
        message={`Are you sure you want to ${showConfirmAction?.label.toLowerCase()} this withdrawal for ₹${selectedReq?.amountInInr.toFixed(0)}?`}
        confirmText={`Yes, ${showConfirmAction?.label}`}
        onConfirm={handleActionExecution}
        onCancel={() => setShowConfirmAction(null)}
        isDanger={showConfirmAction?.status === RequestStatus.REJECTED}
      />

      {/* Confirmation for Clear History */}
      <ConfirmationDialog 
        isOpen={showClearConfirm}
        title="Clear History?"
        message="This will permanently delete all processed (Approved and Rejected) requests from the database. This action cannot be undone."
        confirmText="Clear All"
        onConfirm={handleClearHistory}
        onCancel={() => setShowClearConfirm(false)}
        isDanger={true}
      />
    </Layout>
  );
};

export default AdminPanel;
