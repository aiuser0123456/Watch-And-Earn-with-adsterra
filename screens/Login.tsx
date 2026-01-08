
import React, { useState, useEffect } from 'react';
import { loginWithGoogle, loginAsAdmin, checkRedirectResult } from '../services/mockData';
import { useApp } from '../App';

const Login: React.FC = () => {
  const { setUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if we just returned from a Google Redirect
  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const user = await checkRedirectResult();
        if (user) setUser(user);
      } catch (e: any) {
        console.error("Redirect Login Error:", e);
        setErrorMsg("Redirect login failed. Please try again.");
      }
    };
    handleRedirect();
  }, [setUser]);

  const handleLogin = async (isAdmin: boolean = false) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isAdmin) {
        const user = await loginAsAdmin();
        setUser(user);
      } else {
        await loginWithGoogle();
        // The app will redirect to Google's sign-in page now
      }
    } catch (e: any) {
      console.error("Login attempt failed:", e);
      setErrorMsg("Failed to start Google login. Check your internet.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-8 relative min-h-screen bg-[#102216]">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[110px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[110px]" />
      </div>

      <div className="mt-6 text-center z-10 flex flex-col items-center">
        <div className="w-full max-w-[260px] aspect-square mb-10 relative">
          <div className="absolute inset-0 bg-emerald-400/10 blur-[50px] rounded-full scale-90" />
          <div className="relative w-full h-full glass rounded-[44px] p-1.5 border border-white/20 overflow-hidden shadow-2xl">
             <div className="absolute top-6 left-0 right-0 text-center z-20">
               <span className="text-white/90 text-[10px] font-black tracking-[0.5em] uppercase">Emerald Rewards</span>
             </div>
             <img 
               src="https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?q=80&w=600&auto=format&fit=crop" 
               className="w-full h-full object-cover rounded-[38px] brightness-105" 
               alt="Emerald" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent opacity-60" />
          </div>
        </div>
        
        <h1 className="text-[40px] font-black mb-4 leading-none tracking-tight">
          Watch Ads <br/>
          <span className="text-[#13ec5b]">Earn Gift Cards</span>
        </h1>
        
        <p className="text-gray-400 text-sm max-w-[280px] mx-auto opacity-80 font-medium">
          Secure and simple. Sign in to start collecting points for your Google Play wallet.
        </p>
      </div>

      <div className="mb-6 z-10 space-y-5">
        <button 
          onClick={() => handleLogin(false)}
          disabled={loading}
          className="w-full h-[68px] bg-white rounded-2xl flex items-center justify-between px-6 hover:bg-gray-50 active:scale-[0.97] transition-all shadow-xl group"
        >
          <div className="flex items-center gap-4">
             {loading ? (
               <div className="w-6 h-6 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin" />
             ) : (
               <svg className="w-6 h-6" viewBox="0 0 48 48">
                 <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
               </svg>
             )}
             <span className="text-[#102216] text-base font-black">Continue with Google</span>
          </div>
          <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {errorMsg && (
          <p className="text-center text-red-400 text-[10px] font-bold uppercase tracking-widest bg-red-400/10 py-2 rounded-lg border border-red-400/20">
            {errorMsg}
          </p>
        )}

        <button 
          onClick={() => handleLogin(true)}
          className="w-full py-2 text-[10px] text-gray-700 hover:text-emerald-500 transition-colors font-black uppercase tracking-widest opacity-30"
        >
          Admin Portal
        </button>
      </div>
    </div>
  );
};

export default Login;
