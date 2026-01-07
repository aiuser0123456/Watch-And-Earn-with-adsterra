
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import Layout from '../components/Layout';
import { ICONS, EXCHANGE_RATE, CONVERSION_FACTOR } from '../constants';
import ConfirmationDialog from '../components/ConfirmationDialog';

const Withdraw: React.FC = () => {
  const { user, submitWithdraw } = useApp();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number>(1000);
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleWithdraw = async () => {
    if (!user) return;
    
    setShowConfirm(false);
    setLoading(true);
    try {
      await submitWithdraw(amount, email);
      setSuccess(true);
    } catch (e) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onConfirmClick = () => {
    if (!user) return;
    if (user.points < amount) {
      alert("Insufficient points!");
      return;
    }
    if (amount < 1000) {
      alert("Minimum withdrawal is 1000 points.");
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

        {/* Info Card */}
        <div className="glass p-5 rounded-[24px] flex gap-4 items-start border border-white/5">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold">Exchange Rate</h4>
            <p className="text-gray-400 text-sm">1000 Points = ₹10. Minimum withdrawal is 1000 points.</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-bold mb-4 flex justify-between">
            Payment Method
            <span className="text-[#13ec5b] text-xs font-medium">Recommended</span>
          </h3>
          <div className="space-y-4">
            <div className="p-4 glass rounded-[24px] border-2 border-[#13ec5b] relative">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <img src="https://www.gstatic.com/images/branding/product/1x/play_prism_48dp.png" className="w-8 h-8 object-contain" alt="Google Play" />
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight">Google Play Redeem Code</h4>
                  <p className="text-gray-400 text-xs">Instant delivery via email</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-[#13ec5b] text-[#102216] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ICONS.Check className="w-3 h-3" /> SELECTED
              </div>
            </div>

            <div className="p-4 glass rounded-[24px] border border-white/5 opacity-40">
              <div className="flex items-center gap-4">
                <div className="w-16 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight">Bank Transfer</h4>
                  <p className="text-gray-400 text-xs">Currently unavailable</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold mb-2">Redemption Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 focus:border-[#13ec5b] focus:outline-none transition-colors"
                  placeholder="Enter your email"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                   </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-bold uppercase mb-2 block">Points to Deduct</label>
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
                 <p className="text-gray-400 text-sm">You will receive</p>
                 <p className="text-2xl font-black">₹{(amount * CONVERSION_FACTOR).toFixed(2)}</p>
               </div>
               <div className="text-right">
                 <p className="text-gray-400 text-sm">Points deducted</p>
                 <p className="text-lg font-bold text-red-400">-{amount.toLocaleString()} Pts</p>
               </div>
             </div>
             
             <button 
                onClick={onConfirmClick}
                disabled={loading || user.points < amount}
                className="w-full h-16 bg-[#13ec5b] text-[#102216] rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all shadow-[0_10px_20px_rgba(19,236,91,0.2)]"
             >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-[#102216] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm Withdrawal <ICONS.ArrowRight className="w-6 h-6" />
                  </>
                )}
             </button>
             <p className="text-[10px] text-center text-gray-500">By clicking confirm, you agree to our <span className="underline cursor-pointer" onClick={() => navigate('/terms')}>Terms of Service</span>.</p>
          </div>
        </div>
      </div>

      <ConfirmationDialog 
        isOpen={showConfirm}
        title="Confirm Redemption"
        message={`You are about to redeem ${amount.toLocaleString()} points for a ₹${(amount * CONVERSION_FACTOR).toFixed(2)} Google Play Redeem Code. This action cannot be undone.`}
        confirmText="Yes, Redeem Now"
        onConfirm={handleWithdraw}
        onCancel={() => setShowConfirm(false)}
      />
    </Layout>
  );
};

export default Withdraw;
