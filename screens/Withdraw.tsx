
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import Layout from '../components/Layout';
import { ICONS, EXCHANGE_RATE, CONVERSION_FACTOR } from '../constants';
import ConfirmationDialog from '../components/ConfirmationDialog';

const Withdraw: React.FC = () => {
  const { user, submitWithdraw, showToast } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(1000);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleWithdraw = async () => {
    if (!user) return;
    
    setShowConfirm(false);
    setLoading(true);
    try {
      await submitWithdraw(amount, user.email);
      setSuccess(true);
      showToast("Request submitted successfully!", "success");
    } catch (e) {
      showToast("Submission failed. Check your connection.", "error");
    } finally {
      setLoading(false);
    }
  };

  const onConfirmClick = () => {
    if (!user) return;
    if (user.points < amount) {
      showToast("Insufficient points!", "error");
      return;
    }
    if (amount < 1000) {
      showToast("Minimum withdrawal is 1000 points.", "error");
      return;
    }
    setShowConfirm(true);
  };

  if (!user) return null;

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-[#13ec5b] rounded-full flex items-center justify-center mb-8 animate-pulse shadow-[0_0_40px_rgba(19,236,91,0.5)]">
          <ICONS.Check className="w-12 h-12 text-[#102216]" />
        </div>
        <h2 className="text-3xl font-black mb-4">Request Sent!</h2>
        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          Your withdrawal request of <span className="text-[#13ec5b] font-bold">{amount} Pts</span> has been submitted successfully. It usually takes 24-48 hours to process.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="w-full h-16 bg-[#13ec5b] text-[#102216] rounded-2xl font-bold text-lg active:scale-95 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <Layout title="Withdraw">
      <div className="space-y-8">
        {/* Balance Status */}
        <div className="text-center py-6">
          <p className="text-gray-400 font-bold text-sm tracking-widest mb-1">AVAILABLE BALANCE</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-5xl font-black text-[#13ec5b]">{user.points.toLocaleString()}</span>
            <span className="text-xl font-bold text-[#13ec5b] self-end mb-1">Pts</span>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 glass rounded-full border-[#13ec5b]/30">
             <div className="w-2 h-2 rounded-full bg-[#13ec5b] animate-ping" />
             <span className="text-[#13ec5b] font-bold text-sm">₹{(user.points * CONVERSION_FACTOR).toFixed(2)} Value</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex justify-between">
            Payment Method
            <span className="text-[#13ec5b] text-xs font-medium uppercase tracking-widest">Selected</span>
          </h3>
          <div className="p-4 glass rounded-[24px] border-2 border-[#13ec5b] relative">
            <div className="flex items-center gap-4">
              <div className="w-16 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <img src="https://www.gstatic.com/images/branding/product/1x/play_prism_48dp.png" className="w-8 h-8 object-contain" alt="Google Play" />
              </div>
              <div>
                <h4 className="font-bold text-lg leading-tight">Google Play Redeem Code</h4>
                <p className="text-gray-400 text-xs">Instant delivery to your email</p>
              </div>
            </div>
            <div className="absolute top-4 right-4 bg-[#13ec5b] text-[#102216] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ICONS.Check className="w-3 h-3" /> ACTIVE
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold mb-2">Redemption Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-[10px] font-black uppercase mb-2 block tracking-widest">Delivery Email (Fixed)</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  value={user.email}
                  readOnly
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-gray-400 font-bold outline-none cursor-not-allowed"
                />
              </div>
              <p className="mt-2 text-[9px] text-gray-600 uppercase font-black tracking-tighter">Rewards are strictly sent to your registered account email.</p>
            </div>

            <div>
              <label className="text-gray-400 text-[10px] font-black uppercase mb-2 block tracking-widest">Redeem Amount</label>
              <div className="flex gap-2">
                {[1000, 2000, 5000].map((val) => (
                  <button 
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`flex-1 h-12 rounded-xl font-bold border transition-all ${amount === val ? 'bg-[#13ec5b]/20 border-[#13ec5b] text-[#13ec5b]' : 'glass border-white/5 text-gray-400'}`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-4">
             <div className="flex justify-between items-end">
               <div>
                 <p className="text-gray-400 text-xs font-bold">RECEIVE</p>
                 <p className="text-3xl font-black">₹{(amount * CONVERSION_FACTOR).toFixed(0)}</p>
               </div>
               <div className="text-right">
                 <p className="text-gray-400 text-xs font-bold">COST</p>
                 <p className="text-xl font-black text-red-400">-{amount.toLocaleString()} Pts</p>
               </div>
             </div>
             
             <button 
                onClick={onConfirmClick}
                disabled={loading || user.points < amount}
                className="w-full h-16 bg-[#13ec5b] text-[#102216] rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all shadow-[0_10px_30px_rgba(19,236,91,0.2)]"
             >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-[#102216] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm Redemption <ICONS.ArrowRight className="w-6 h-6" />
                  </>
                )}
             </button>
          </div>
        </div>
      </div>

      <ConfirmationDialog 
        isOpen={showConfirm}
        title="Confirm Redeem?"
        message={`This will deduct ${amount.toLocaleString()} points for a ₹${(amount * CONVERSION_FACTOR).toFixed(0)} Google Play gift card.`}
        confirmText="Yes, Redeem"
        onConfirm={handleWithdraw}
        onCancel={() => setShowConfirm(false)}
      />
    </Layout>
  );
};

export default Withdraw;
