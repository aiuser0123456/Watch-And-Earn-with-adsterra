
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDb } from '../services/mockData';
import Layout from '../components/Layout';
import { WithdrawRequest, RequestStatus, User } from '../types';
import { ICONS } from '../constants';

const AdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedReq, setSelectedReq] = useState<WithdrawRequest | null>(null);
  const [redeemCode, setRedeemCode] = useState('');

  useEffect(() => {
    setRequests(mockDb.getRequests());
    setUsers(mockDb.getUsers());
  }, []);

  const handleAction = (status: RequestStatus) => {
    if (!selectedReq) return;
    
    const allReqs = mockDb.getRequests();
    const updated = allReqs.map(r => {
      if (r.id === selectedReq.id) {
        return { ...r, status, code: status === RequestStatus.APPROVED ? redeemCode : undefined };
      }
      return r;
    });
    
    mockDb.saveRequests(updated);
    setRequests(updated);
    setSelectedReq(null);
    setRedeemCode('');
  };

  return (
    <Layout title="Admin Control" showBack={true}>
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass p-5 rounded-[24px]">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Users</p>
            <p className="text-3xl font-black">{users.length}</p>
          </div>
          <div className="glass p-5 rounded-[24px]">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Pending Requests</p>
            <p className="text-3xl font-black text-yellow-500">
              {requests.filter(r => r.status === RequestStatus.PENDING).length}
            </p>
          </div>
        </div>

        {/* Requests List */}
        <div>
           <h3 className="text-lg font-bold mb-4">Withdraw Requests</h3>
           <div className="space-y-4">
             {requests.map(req => (
               <div key={req.id} className="glass p-5 rounded-[24px] border border-white/5 flex flex-col gap-4">
                 <div className="flex justify-between items-start">
                   <div>
                     <p className="font-bold text-white">{req.userEmail}</p>
                     <p className="text-gray-500 text-xs">{new Date(req.createdAt).toLocaleString()}</p>
                   </div>
                   <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                     req.status === RequestStatus.PENDING ? 'bg-yellow-500/20 text-yellow-500' :
                     req.status === RequestStatus.APPROVED ? 'bg-[#13ec5b]/20 text-[#13ec5b]' : 'bg-red-500/20 text-red-500'
                   }`}>
                     {req.status}
                   </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <p className="text-xl font-black">{req.points} PTS <span className="text-gray-500 text-sm font-normal"> (₹{req.amountInInr})</span></p>
                    {req.status === RequestStatus.PENDING && (
                      <button 
                        onClick={() => setSelectedReq(req)}
                        className="bg-[#13ec5b] text-[#102216] px-4 py-2 rounded-xl font-bold text-sm shadow-[0_5px_15px_rgba(19,236,91,0.2)]"
                      >
                        Action
                      </button>
                    )}
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Action Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="glass w-full max-w-sm p-8 rounded-[32px] border border-white/10 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-2">Process Request</h3>
            <p className="text-gray-400 mb-6">User: {selectedReq.userEmail}</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Redeem Code (if approving)</label>
                <input 
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value)}
                  placeholder="GP-XXXX-XXXX-XXXX"
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 focus:border-[#13ec5b] outline-none"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleAction(RequestStatus.REJECTED)}
                  className="flex-1 h-14 bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl font-bold active:scale-95"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAction(RequestStatus.APPROVED)}
                  className="flex-1 h-14 bg-[#13ec5b] text-[#102216] rounded-2xl font-bold active:scale-95 shadow-xl"
                >
                  Approve
                </button>
              </div>
              
              <button 
                onClick={() => setSelectedReq(null)}
                className="w-full text-gray-500 font-bold text-sm mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminPanel;
