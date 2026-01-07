
import React, { useState } from 'react';
import { loginWithGoogle, loginAsAdmin } from '../services/mockData';
import { useApp } from '../App';
import { COLORS } from '../constants';

const Login: React.FC = () => {
  const { setUser } = useApp();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (isAdmin: boolean = false) => {
    setLoading(true);
    try {
      const user = isAdmin ? await loginAsAdmin() : await loginWithGoogle();
      setUser(user);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-8 relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-20 right-[-50px] w-64 h-64 bg-[#13ec5b] rounded-full blur-[100px]" />
        <div className="absolute bottom-40 left-[-50px] w-64 h-64 bg-[#13ec5b] rounded-full blur-[120px]" />
      </div>

      <div className="mt-12 text-center z-10 flex flex-col items-center">
        {/* Updated Hero Image to Emerald Gem style */}
        <div className="w-full max-w-[280px] aspect-square mb-10 glass rounded-[40px] flex items-center justify-center p-4 relative overflow-hidden group shadow-[0_20px_50px_rgba(19,236,91,0.2)]">
          <img 
            src="https://images.unsplash.com/photo-1599707334386-dc049303120c?auto=format&fit=crop&q=80&w=400" 
            className="w-full h-full object-cover rounded-[30px] group-hover:scale-105 transition-transform duration-700" 
            alt="Emerald" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent" />
        </div>
        
        <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight">
          Earn Crypto & <br/>
          <span className="text-[#13ec5b]">Points</span>
        </h1>
        <p className="text-gray-400 text-base leading-relaxed max-w-[280px] mx-auto">
          The easiest way to monetize your free time. Watch short ads and withdraw instantly to your wallet.
        </p>
      </div>

      <div className="mb-8 z-10 space-y-5">
        {/* Updated Button Styling to match High-Fidelity screenshot */}
        <button 
          onClick={() => handleLogin(false)}
          disabled={loading}
          className="w-full h-14 bg-white rounded-2xl flex items-center justify-center gap-4 hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50 relative shadow-xl"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-[#102216] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {/* High quality Google Icon SVG */}
              <svg className="w-6 h-6" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C40.483,35.548,44,30.346,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              <span className="text-black text-lg font-bold">Continue with Google</span>
              <svg className="w-5 h-5 text-gray-400 absolute right-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>

        <p className="text-center text-[10px] text-gray-500 font-medium uppercase tracking-wider">
          By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> & <span className="underline cursor-pointer">Privacy Policy</span>
        </p>

        <button 
          onClick={() => handleLogin(true)}
          className="w-full py-2 text-xs text-gray-700/80 hover:text-gray-500 transition-colors font-semibold"
        >
          Login as Admin (Demo)
        </button>
      </div>
    </div>
  );
};

export default Login;
