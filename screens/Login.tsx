
import React, { useState } from 'react';
import { loginWithGoogle, loginAsAdmin } from '../services/mockData';
import { useApp } from '../App';

const Login: React.FC = () => {
  const { setUser } = useApp();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (isAdmin: boolean = false) => {
    setLoading(true);
    try {
      const user = isAdmin ? await loginAsAdmin() : await loginWithGoogle();
      setUser(user);
    } catch (e: any) {
      console.error("Login failed:", e);
      if (e.code === 'auth/popup-blocked') {
        alert("Account selection popup was blocked. Please enable popups for this site.");
      } else if (e.code === 'auth/cancelled-popup-request') {
        // Do nothing, user just closed the popup
      } else {
        alert("Failed to connect to Google. Please check your internet and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-8 relative min-h-screen">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[110px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[110px]" />
      </div>

      <div className="mt-6 text-center z-10 flex flex-col items-center">
        {/* Emerald Hero Container - High Fidelity UI */}
        <div className="w-full max-w-[280px] aspect-square mb-10 relative group">
          {/* Subtle outer glow layer */}
          <div className="absolute inset-0 bg-emerald-400/10 blur-[50px] rounded-full scale-90 group-hover:scale-100 transition-transform duration-1000" />
          
          <div className="relative w-full h-full glass rounded-[44px] p-1.5 border border-white/20 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
             {/* "Emerald" Brand Overlay */}
             <div className="absolute top-6 left-0 right-0 text-center z-20">
               <span className="text-white/90 text-[10px] font-black tracking-[0.5em] uppercase drop-shadow-md">Emerald</span>
             </div>
             
             <img 
               src="https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?q=80&w=600&auto=format&fit=crop" 
               className="w-full h-full object-cover rounded-[38px] brightness-105 contrast-110" 
               alt="Emerald Gemstone" 
               onError={(e) => {
                 // Solid reliable backup if Unsplash is down
                 (e.target as HTMLImageElement).src = "https://cdn.pixabay.com/photo/2017/01/09/02/02/emerald-1965416_1280.jpg";
               }}
             />
             
             {/* Bottom vignette */}
             <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-transparent to-transparent opacity-60" />
             
             {/* Glossy shine effect */}
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/10 via-transparent to-transparent rotate-[30deg] pointer-events-none" />
          </div>
        </div>
        
        <h1 className="text-[44px] font-black mb-4 leading-[1.05] tracking-tight text-white drop-shadow-sm">
          Earn Crypto & <br/>
          <span className="text-[#13ec5b]">Points</span>
        </h1>
        
        <p className="text-gray-400 text-[15px] leading-relaxed max-w-[280px] mx-auto opacity-90 font-medium">
          The easiest way to monetize your free time. Watch short ads and withdraw instantly to your wallet.
        </p>
      </div>

      <div className="mb-6 z-10 space-y-5">
        {/* "Continue with Google" - Exact High-Fidelity Match */}
        <button 
          onClick={() => handleLogin(false)}
          disabled={loading}
          className="w-full h-[68px] bg-white rounded-2xl flex items-center justify-between px-6 hover:bg-gray-50 active:scale-[0.97] transition-all disabled:opacity-50 shadow-[0_15px_30px_rgba(0,0,0,0.3)] group relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
             {loading ? (
               <div className="w-6 h-6 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin" />
             ) : (
               <svg className="w-6 h-6" viewBox="0 0 48 48">
                 <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                 <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                 <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                 <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.483,35.548,44,30.346,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
               </svg>
             )}
             <span className="text-[#102216] text-[17px] font-extrabold tracking-tight">Continue with Google</span>
          </div>
          <svg className="w-5 h-5 text-gray-300 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-[0.15em] px-2 leading-relaxed opacity-70">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> & <span className="underline cursor-pointer">Privacy Policy</span>
        </p>

        <button 
          onClick={() => handleLogin(true)}
          className="w-full py-2 text-[10px] text-gray-700 hover:text-emerald-500 transition-colors font-black uppercase tracking-widest opacity-40"
        >
          Login as Admin (Demo)
        </button>
      </div>
    </div>
  );
};

export default Login;
